import { Medicine, DoseLog, ESP32Status, EmergencyContact, MedicalProfile, AppNotification } from '../types';

export const INITIAL_MEDICINES: Medicine[] = [];

export const INITIAL_DOSE_LOGS: DoseLog[] = [];

export const DISCONNECTED_ESP32_STATUS: ESP32Status = {
  isConnected: false,
  deviceId: 'ESP32-DISCONNECTED',
  ipAddress: 'Offline',
  wifiSSID: 'Not Connected',
  wifiSignalDbm: -99,
  batteryLevel: 0,
  isCharging: false,
  lastSyncedAt: 'Never',
  encryptionMode: 'None / Unbound Device',
  compartments: {
    Morning: { ledActive: false, color: '#0ea5e9', pillCount: 0 },
    Afternoon: { ledActive: false, color: '#10b981', pillCount: 0 },
    Evening: { ledActive: false, color: '#f59e0b', pillCount: 0 },
    Night: { ledActive: false, color: '#6366f1', pillCount: 0 },
  },
  physicalButtonPressed: false,
};

export const INITIAL_ESP32_STATUS: ESP32Status = {
  isConnected: true,
  deviceId: 'ESP32-MEDIGUARD-X1',
  ipAddress: '192.168.1.100',
  wifiSSID: 'Home_Wi-Fi',
  wifiSignalDbm: -60,
  batteryLevel: 100,
  isCharging: false,
  lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  encryptionMode: 'AES-256-GCM / TLS 1.3',
  compartments: {
    Morning: { ledActive: false, color: '#0ea5e9', pillCount: 0 },
    Afternoon: { ledActive: false, color: '#10b981', pillCount: 0 },
    Evening: { ledActive: false, color: '#f59e0b', pillCount: 0 },
    Night: { ledActive: false, color: '#6366f1', pillCount: 0 },
  },
  physicalButtonPressed: false,
};

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [];

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  fullName: '',
  dateOfBirth: '',
  bloodType: '',
  primaryPhysician: '',
  physicianPhone: '',
  hospitalPreference: '',
  chronicConditions: [],
  allergies: [],
  insurancePolicyNumber: '',
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];

