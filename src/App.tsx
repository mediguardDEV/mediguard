import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './components/HomePage';
import { DashboardView } from './components/DashboardView';
import { MedicineManagerView } from './components/MedicineManagerView';
import { MediGuardHealthView } from './components/MediGuardHealthView';
import { AnalyticsView } from './components/AnalyticsView';
import { PrivacyTermsModal } from './components/PrivacyTermsModal';

import {
  Medicine,
  DoseLog,
  EmergencyContact,
  MedicalProfile,
  ESP32Status,
  UserSession,
  AppNotification,
} from './types';

import {
  fetchMedicines,
  saveMedicine,
  deleteMedicine,
  fetchDoseLogs,
  updateDoseStatus,
  fetchEmergencyContacts,
  saveEmergencyContact,
  fetchMedicalProfile,
  saveMedicalProfile,
  fetchESP32Status,
  saveESP32Status,
  getActiveUserFromSession,
  saveActiveUserToSession,
  getSupabaseClient,
  verifyUserInSupabase,
} from './lib/supabase';

import { INITIAL_NOTIFICATIONS } from './lib/sampleData';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'health' | 'manager' | 'analytics'>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'privacy' | 'terms' | null>(null);

  // User state
  const [user, setUser] = useState<UserSession | null>(null);

  // Data states
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>({
    fullName: '',
    dateOfBirth: '',
    bloodType: '',
    primaryPhysician: '',
    physicianPhone: '',
    hospitalPreference: '',
    chronicConditions: [],
    allergies: [],
  });
  const [esp32Status, setEsp32Status] = useState<ESP32Status>({
    isConnected: true,
    deviceId: 'ESP32-MEDIGUARD-X1',
    ipAddress: '192.168.1.100',
    wifiSSID: 'Home_Wi-Fi',
    wifiSignalDbm: -60,
    batteryLevel: 100,
    isCharging: false,
    lastSyncedAt: new Date().toLocaleTimeString(),
    encryptionMode: 'AES-256-GCM / TLS 1.3',
    compartments: {
      Morning: { ledActive: false, color: '#0ea5e9', pillCount: 0 },
      Afternoon: { ledActive: false, color: '#10b981', pillCount: 0 },
      Evening: { ledActive: false, color: '#f59e0b', pillCount: 0 },
      Night: { ledActive: false, color: '#6366f1', pillCount: 0 },
    },
    physicalButtonPressed: false,
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Helper to verify user in Supabase and automatically log out if missing
  const verifyAndEnforceUserPresence = async (candidateUser: UserSession | null): Promise<UserSession | null> => {
    if (!candidateUser) return null;
    const exists = await verifyUserInSupabase(candidateUser);
    if (!exists) {
      console.warn(`User ${candidateUser.email} not found on Supabase. Logging out automatically.`);
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut().catch(() => {});
      }
      saveActiveUserToSession(null);
      setUser(null);
      setNotifications((prev) => [
        {
          id: `notif-logout-${Date.now()}`,
          title: 'Account Verification Failed',
          message: `The user account (${candidateUser.email}) does not exist in the Supabase database. Automatically logged out for security.`,
          type: 'warning',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
      return null;
    }
    return candidateUser;
  };

  // Load initial data & active user with Supabase Auth state listener
  useEffect(() => {
    async function loadData() {
      try {
        const sessionUser = getActiveUserFromSession();
        if (sessionUser) {
          const verified = await verifyAndEnforceUserPresence(sessionUser);
          if (verified) {
            setUser(verified);
          }
        }
        const meds = await fetchMedicines();
        setMedicines(meds);
        const logs = await fetchDoseLogs();
        setDoseLogs(logs);
        const contacts = await fetchEmergencyContacts();
        setEmergencyContacts(contacts);
        const profile = await fetchMedicalProfile();
        setMedicalProfile(profile);
        const status = await fetchESP32Status();
        setEsp32Status(status);
      } catch (err) {
        console.error('Error loading MediGuard database:', err);
      }
    }
    loadData();

    // Listen for Supabase Auth state updates
    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          const confirmedUser: UserSession = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: metadata.full_name || metadata.fullName || session.user.email?.split('@')[0] || 'User',
            patientName: metadata.patient_name || metadata.patientName || session.user.email?.split('@')[0] || 'Patient',
            phone: metadata.phone || '',
            emergencyEmail: metadata.emergency_email || '',
            emergencyPhone: metadata.emergency_phone || '',
            isVerified: !!session.user.email_confirmed_at,
            provider: 'email',
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          const verified = await verifyAndEnforceUserPresence(confirmedUser);
          if (verified) {
            setUser(verified);
            saveActiveUserToSession(verified);
          }
        } else {
          // If no active auth session, verify if local user session still exists in Supabase
          const currentLocal = getActiveUserFromSession();
          if (currentLocal) {
            await verifyAndEnforceUserPresence(currentLocal);
          }
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const metadata = session.user.user_metadata || {};
          const confirmedUser: UserSession = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: metadata.full_name || metadata.fullName || session.user.email?.split('@')[0] || 'User',
            patientName: metadata.patient_name || metadata.patientName || session.user.email?.split('@')[0] || 'Patient',
            phone: metadata.phone || '',
            emergencyEmail: metadata.emergency_email || '',
            emergencyPhone: metadata.emergency_phone || '',
            isVerified: !!session.user.email_confirmed_at,
            provider: 'email',
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          const verified = await verifyAndEnforceUserPresence(confirmedUser);
          if (verified) {
            setUser(verified);
            saveActiveUserToSession(verified);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          saveActiveUserToSession(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Handlers with Authentication Guard
  const handleSaveMedicine = async (med: Omit<Medicine, 'id' | 'createdAt'> & { id?: string }) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const saved = await saveMedicine(med);
    const updated = await fetchMedicines();
    setMedicines(updated);
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    await deleteMedicine(id);
    const updated = await fetchMedicines();
    setMedicines(updated);
  };

  const handleUpdateDoseStatus = async (
    logId: string,
    status: 'taken' | 'missed' | 'skipped',
    reason?: string
  ) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const updatedLogs = await updateDoseStatus(logId, status, reason);
    setDoseLogs(updatedLogs);
  };

  const handleSaveContact = async (contact: EmergencyContact) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const updated = await saveEmergencyContact(contact);
    setEmergencyContacts(updated);
  };

  const handleSaveProfile = async (profile: MedicalProfile) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const updated = await saveMedicalProfile(profile);
    setMedicalProfile(updated);
  };

  const handleUpdateESP32Status = async (status: ESP32Status) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const updated = await saveESP32Status(status);
    setEsp32Status(updated);
  };

  const EMPTY_MEDICAL_PROFILE: MedicalProfile = {
    fullName: '',
    dateOfBirth: '',
    bloodType: 'Not Specified',
    primaryPhysician: '',
    physicianPhone: '',
    hospitalPreference: '',
    chronicConditions: [],
    allergies: [],
    insurancePolicyNumber: '',
  };

  const handleLogout = () => {
    saveActiveUserToSession(null);
    setUser(null);
    setEmergencyContacts([]);
    setMedicalProfile(EMPTY_MEDICAL_PROFILE);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F4F8] text-[#1E293B] font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        esp32Status={esp32Status}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow pb-16 md:pb-0">
        {currentView === 'home' && (
          <HomePage onNavigate={setCurrentView} esp32Status={esp32Status} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            medicines={medicines}
            doseLogs={doseLogs}
            esp32Status={esp32Status}
            notifications={notifications}
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onUpdateDoseStatus={handleUpdateDoseStatus}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'manager' && (
          <MedicineManagerView
            medicines={medicines}
            esp32Status={esp32Status}
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSaveMedicine={handleSaveMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onUpdateESP32Status={handleUpdateESP32Status}
          />
        )}

        {currentView === 'health' && (
          <MediGuardHealthView
            emergencyContacts={user ? emergencyContacts : []}
            medicalProfile={user ? medicalProfile : EMPTY_MEDICAL_PROFILE}
            doseLogs={user ? doseLogs : []}
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSaveContact={handleSaveContact}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            doseLogs={doseLogs}
            medicines={medicines}
            user={user}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setModalType('privacy')}
        onOpenTerms={() => setModalType('terms')}
        onNavigate={setCurrentView}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <PrivacyTermsModal
        isOpen={!!modalType}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
}
