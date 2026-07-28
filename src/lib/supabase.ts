import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Medicine, DoseLog, EmergencyContact, MedicalProfile, ESP32Status, UserSession } from '../types';
import {
  INITIAL_MEDICINES,
  INITIAL_DOSE_LOGS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_MEDICAL_PROFILE,
  INITIAL_ESP32_STATUS,
} from './sampleData';

const SUPABASE_URL_KEY = 'mediguard_supabase_url';
const SUPABASE_ANON_KEY = 'mediguard_supabase_anon_key';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseCredentials() {
  const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url = localStorage.getItem(SUPABASE_URL_KEY) || env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem(SUPABASE_ANON_KEY) || env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
}

export function saveSupabaseCredentials(url: string, key: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_ANON_KEY, key);
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
    } catch {
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const { url, key } = getSupabaseCredentials();
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch {
      supabaseInstance = null;
    }
  }
  return null;
}

// Local Storage Keys
const LOCAL_MEDICINES_KEY = 'mediguard_medicines_v1';
const LOCAL_DOSE_LOGS_KEY = 'mediguard_dose_logs_v1';
const LOCAL_EMERGENCY_KEY = 'mediguard_emergency_v1';
const LOCAL_PROFILE_KEY = 'mediguard_profile_v1';
const LOCAL_ESP32_KEY = 'mediguard_esp32_v1';
const LOCAL_USERS_KEY = 'mediguard_users_v2';
const LOCAL_ACTIVE_USER_KEY = 'mediguard_active_user_v2';

// User Auth Database Helpers
export async function findUserInDatabase(email: string): Promise<UserSession | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return null;

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (!error && data) {
        return {
          id: data.id,
          email: data.email,
          fullName: data.fullName || data.full_name || '',
          patientName: data.patientName || data.patient_name || '',
          phone: data.phone || '',
          emergencyEmail: data.emergencyEmail || data.emergency_email || '',
          emergencyPhone: data.emergencyPhone || data.emergency_phone || '',
          password: data.password || '',
          isVerified: true,
          provider: 'email',
          createdAt: data.createdAt || data.created_at || new Date().toISOString(),
        };
      }
    } catch {
      // Fallback
    }
  }

  const raw = localStorage.getItem(LOCAL_USERS_KEY);
  if (raw) {
    try {
      const users: UserSession[] = JSON.parse(raw);
      const found = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);
      if (found) return found;
    } catch {
      // ignore
    }
  }

  return null;
}

export async function registerUserInDatabase(userData: {
  email: string;
  fullName: string;
  patientName: string;
  phone: string;
  emergencyEmail: string;
  emergencyPhone: string;
  password: string;
}): Promise<{ user: UserSession | null; confirmationNeeded?: boolean }> {
  const cleanEmail = userData.email.toLowerCase().trim();
  const client = getSupabaseClient();

  let supabaseUserId = `usr-${Date.now()}`;
  let confirmationNeeded = false;

  if (client) {
    // Attempt Supabase Native Auth Registration
    const { data: authData, error: authError } = await client.auth.signUp({
      email: cleanEmail,
      password: userData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: userData.fullName,
          patient_name: userData.patientName,
          phone: userData.phone,
          emergency_email: userData.emergencyEmail,
          emergency_phone: userData.emergencyPhone,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (authData?.user) {
      supabaseUserId = authData.user.id;
      // If user session is null or email is not confirmed, email confirmation is required
      if (!authData.session || !authData.user.email_confirmed_at) {
        confirmationNeeded = true;
      }
    }

    // Write user profile to Supabase users database table
    try {
      await client.from('users').upsert({
        id: supabaseUserId,
        email: cleanEmail,
        full_name: userData.fullName,
        patient_name: userData.patientName,
        phone: userData.phone,
        emergency_email: userData.emergencyEmail,
        emergency_phone: userData.emergencyPhone,
        created_at: new Date().toISOString(),
      });
    } catch {
      // ignore DB table error if table schema pending
    }
  } else {
    const existing = await findUserInDatabase(cleanEmail);
    if (existing) {
      throw new Error('An account with this email is already registered. Please sign in instead.');
    }
  }

  const newUser: UserSession = {
    id: supabaseUserId,
    email: cleanEmail,
    fullName: userData.fullName.trim(),
    patientName: userData.patientName.trim() || userData.fullName.trim(),
    phone: userData.phone.trim(),
    emergencyEmail: userData.emergencyEmail.trim(),
    emergencyPhone: userData.emergencyPhone.trim(),
    isVerified: !confirmationNeeded,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  if (newUser.emergencyPhone || newUser.emergencyEmail) {
    const newEmergencyContact: EmergencyContact = {
      id: `ec-${Date.now()}`,
      name: (newUser.patientName || newUser.fullName) + ' Emergency Contact',
      relationship: 'Primary Family Contact',
      phone: newUser.emergencyPhone || 'N/A',
      isPrimary: true,
    };
    saveEmergencyContact(newEmergencyContact);
  }

  if (confirmationNeeded) {
    // Strictly do NOT log in unconfirmed users into active session
    return { user: null, confirmationNeeded: true };
  }

  saveActiveUserToSession(newUser);
  return { user: newUser, confirmationNeeded: false };
}

export async function loginUserInDatabase(email: string, password?: string): Promise<UserSession> {
  const cleanEmail = email.toLowerCase().trim();
  const client = getSupabaseClient();

  if (client) {
    // Attempt Supabase Native Auth Login
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: password || '',
    });

    if (authError) {
      // Throw Supabase error directly (e.g., "Email not confirmed", "Invalid login credentials")
      throw new Error(authError.message);
    }

    if (authData?.user) {
      const metadata = authData.user.user_metadata || {};

      // Try fetching user profile from Supabase table
      let dbProfile: Partial<UserSession> = {};
      try {
        const { data: dbUserData } = await client
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
        if (dbUserData) {
          dbProfile = {
            fullName: dbUserData.full_name || dbUserData.fullName,
            patientName: dbUserData.patient_name || dbUserData.patientName,
            phone: dbUserData.phone,
            emergencyEmail: dbUserData.emergency_email || dbUserData.emergencyEmail,
            emergencyPhone: dbUserData.emergency_phone || dbUserData.emergencyPhone,
          };
        }
      } catch {
        // ignore
      }

      const userFromAuth: UserSession = {
        id: authData.user.id,
        email: authData.user.email || cleanEmail,
        fullName: dbProfile.fullName || metadata.full_name || metadata.fullName || cleanEmail.split('@')[0],
        patientName: dbProfile.patientName || metadata.patient_name || metadata.patientName || cleanEmail.split('@')[0],
        phone: dbProfile.phone || metadata.phone || '',
        emergencyEmail: dbProfile.emergencyEmail || metadata.emergency_email || '',
        emergencyPhone: dbProfile.emergencyPhone || metadata.emergency_phone || '',
        isVerified: !!authData.user.email_confirmed_at,
        provider: 'email',
        createdAt: authData.user.created_at || new Date().toISOString(),
      };
      saveActiveUserToSession(userFromAuth);
      return userFromAuth;
    }
  }

  // Fallback lookup ONLY when Supabase client is unconfigured
  const user = await findUserInDatabase(cleanEmail);

  if (!user) {
    throw new Error('Account not found. Please register a new account to sign in.');
  }

  if (password && user.password && user.password !== password) {
    throw new Error('Incorrect password. Please verify your credentials and try again.');
  }

  saveActiveUserToSession(user);
  return user;
}

export async function sendSupabasePasswordReset(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const client = getSupabaseClient();
  if (client) {
    const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: window.location.origin,
    });
    if (error) {
      throw new Error(`Supabase Reset Error: ${error.message}`);
    }
  }
}

export function getActiveUserFromSession(): UserSession | null {
  const raw = localStorage.getItem(LOCAL_ACTIVE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveUserToSession(user: UserSession | null): void {
  if (user) {
    localStorage.setItem(LOCAL_ACTIVE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_ACTIVE_USER_KEY);
  }
}

// Seed local storage if empty
export function initLocalStorageStore() {
  if (!localStorage.getItem(LOCAL_MEDICINES_KEY)) {
    localStorage.setItem(LOCAL_MEDICINES_KEY, JSON.stringify(INITIAL_MEDICINES));
  }
  if (!localStorage.getItem(LOCAL_DOSE_LOGS_KEY)) {
    localStorage.setItem(LOCAL_DOSE_LOGS_KEY, JSON.stringify(INITIAL_DOSE_LOGS));
  }
  if (!localStorage.getItem(LOCAL_EMERGENCY_KEY)) {
    localStorage.setItem(LOCAL_EMERGENCY_KEY, JSON.stringify(INITIAL_EMERGENCY_CONTACTS));
  }
  if (!localStorage.getItem(LOCAL_PROFILE_KEY)) {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(INITIAL_MEDICAL_PROFILE));
  }
  if (!localStorage.getItem(LOCAL_ESP32_KEY)) {
    localStorage.setItem(LOCAL_ESP32_KEY, JSON.stringify(INITIAL_ESP32_STATUS));
  }
}

// Data Access Methods with Supabase or Local Fallback
export async function fetchMedicines(): Promise<Medicine[]> {
  initLocalStorageStore();
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('medicines').select('*').order('createdAt', { ascending: false });
      if (!error && data && data.length > 0) return data as Medicine[];
    } catch {
      // Fallback to local store
    }
  }
  const raw = localStorage.getItem(LOCAL_MEDICINES_KEY);
  return raw ? JSON.parse(raw) : INITIAL_MEDICINES;
}

export async function saveMedicine(medicine: Omit<Medicine, 'id' | 'createdAt'> & { id?: string }): Promise<Medicine> {
  initLocalStorageStore();
  const currentMedicines = await fetchMedicines();
  const client = getSupabaseClient();

  const newMedicine: Medicine = {
    ...medicine,
    id: medicine.id || `med-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  let updatedList: Medicine[];
  const existingIdx = currentMedicines.findIndex((m) => m.id === newMedicine.id);
  if (existingIdx >= 0) {
    updatedList = [...currentMedicines];
    updatedList[existingIdx] = newMedicine;
  } else {
    updatedList = [newMedicine, ...currentMedicines];
  }

  localStorage.setItem(LOCAL_MEDICINES_KEY, JSON.stringify(updatedList));

  if (client) {
    try {
      await client.from('medicines').upsert(newMedicine);
    } catch {
      // Ignore cloud sync error
    }
  }

  return newMedicine;
}

export async function deleteMedicine(id: string): Promise<void> {
  initLocalStorageStore();
  const current = await fetchMedicines();
  const filtered = current.filter((m) => m.id !== id);
  localStorage.setItem(LOCAL_MEDICINES_KEY, JSON.stringify(filtered));

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('medicines').delete().eq('id', id);
    } catch {
      // Ignore delete error
    }
  }
}

export async function fetchDoseLogs(): Promise<DoseLog[]> {
  initLocalStorageStore();
  const raw = localStorage.getItem(LOCAL_DOSE_LOGS_KEY);
  return raw ? JSON.parse(raw) : INITIAL_DOSE_LOGS;
}

export async function updateDoseStatus(
  logId: string,
  status: 'taken' | 'missed' | 'skipped',
  reason?: string
): Promise<DoseLog[]> {
  initLocalStorageStore();
  const logs = await fetchDoseLogs();
  const updated = logs.map((log) => {
    if (log.id === logId) {
      return {
        ...log,
        status,
        loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasonIfMissed: reason || log.reasonIfMissed,
      };
    }
    return log;
  });

  localStorage.setItem(LOCAL_DOSE_LOGS_KEY, JSON.stringify(updated));
  return updated;
}

export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  initLocalStorageStore();
  const raw = localStorage.getItem(LOCAL_EMERGENCY_KEY);
  return raw ? JSON.parse(raw) : INITIAL_EMERGENCY_CONTACTS;
}

export async function saveEmergencyContact(contact: EmergencyContact): Promise<EmergencyContact[]> {
  initLocalStorageStore();
  const contacts = await fetchEmergencyContacts();
  const existingIdx = contacts.findIndex((c) => c.id === contact.id);
  let updated: EmergencyContact[];
  if (existingIdx >= 0) {
    updated = [...contacts];
    updated[existingIdx] = contact;
  } else {
    updated = [...contacts, contact];
  }
  localStorage.setItem(LOCAL_EMERGENCY_KEY, JSON.stringify(updated));
  return updated;
}

export async function fetchMedicalProfile(): Promise<MedicalProfile> {
  initLocalStorageStore();
  const raw = localStorage.getItem(LOCAL_PROFILE_KEY);
  return raw ? JSON.parse(raw) : INITIAL_MEDICAL_PROFILE;
}

export async function saveMedicalProfile(profile: MedicalProfile): Promise<MedicalProfile> {
  initLocalStorageStore();
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function fetchESP32Status(): Promise<ESP32Status> {
  initLocalStorageStore();
  const raw = localStorage.getItem(LOCAL_ESP32_KEY);
  return raw ? JSON.parse(raw) : INITIAL_ESP32_STATUS;
}

export async function saveESP32Status(status: ESP32Status): Promise<ESP32Status> {
  initLocalStorageStore();
  localStorage.setItem(LOCAL_ESP32_KEY, JSON.stringify(status));
  return status;
}
