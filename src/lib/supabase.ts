import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Medicine, DoseLog, EmergencyContact, MedicalProfile, ESP32Status } from '../types';
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
