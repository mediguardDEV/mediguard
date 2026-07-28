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

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
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
  }, []);

  // Handlers
  const handleSaveMedicine = async (med: Omit<Medicine, 'id' | 'createdAt'> & { id?: string }) => {
    const saved = await saveMedicine(med);
    const updated = await fetchMedicines();
    setMedicines(updated);
  };

  const handleDeleteMedicine = async (id: string) => {
    await deleteMedicine(id);
    const updated = await fetchMedicines();
    setMedicines(updated);
  };

  const handleUpdateDoseStatus = async (
    logId: string,
    status: 'taken' | 'missed' | 'skipped',
    reason?: string
  ) => {
    const updatedLogs = await updateDoseStatus(logId, status, reason);
    setDoseLogs(updatedLogs);
  };

  const handleSaveContact = async (contact: EmergencyContact) => {
    const updated = await saveEmergencyContact(contact);
    setEmergencyContacts(updated);
  };

  const handleSaveProfile = async (profile: MedicalProfile) => {
    const updated = await saveMedicalProfile(profile);
    setMedicalProfile(updated);
  };

  const handleUpdateESP32Status = async (status: ESP32Status) => {
    const updated = await saveESP32Status(status);
    setEsp32Status(updated);
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
        onLogout={() => setUser(null)}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <HomePage onNavigate={setCurrentView} esp32Status={esp32Status} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView
            medicines={medicines}
            doseLogs={doseLogs}
            esp32Status={esp32Status}
            notifications={notifications}
            onUpdateDoseStatus={handleUpdateDoseStatus}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'manager' && (
          <MedicineManagerView
            medicines={medicines}
            esp32Status={esp32Status}
            onSaveMedicine={handleSaveMedicine}
            onDeleteMedicine={handleDeleteMedicine}
            onUpdateESP32Status={handleUpdateESP32Status}
          />
        )}

        {currentView === 'health' && (
          <MediGuardHealthView
            emergencyContacts={emergencyContacts}
            medicalProfile={medicalProfile}
            doseLogs={doseLogs}
            onSaveContact={handleSaveContact}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView doseLogs={doseLogs} medicines={medicines} />
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
