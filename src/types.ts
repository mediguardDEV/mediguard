export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface Medicine {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "1 pill"
  frequency: string; // e.g. "Once daily", "Twice daily"
  compartment: TimeOfDay;
  scheduledTime: string; // e.g. "08:00 AM"
  foodInstruction: 'Before Food' | 'After Food' | 'With Food' | 'Anytime';
  stockCount: number;
  totalPills: number;
  expiryDate: string; // ISO YYYY-MM-DD
  imageUrl?: string;
  barcode?: string;
  notes?: string;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  compartment: TimeOfDay;
  scheduledTime: string;
  loggedAt?: string;
  status: 'taken' | 'missed' | 'skipped' | 'pending';
  date: string; // YYYY-MM-DD
  reasonIfMissed?: string;
}

export interface ESP32Status {
  isConnected: boolean;
  deviceId: string;
  ipAddress: string;
  wifiSSID: string;
  wifiSignalDbm: number;
  batteryLevel: number;
  isCharging: boolean;
  lastSyncedAt: string;
  encryptionMode: string;
  compartments: {
    Morning: { ledActive: boolean; color: string; pillCount: number };
    Afternoon: { ledActive: boolean; color: string; pillCount: number };
    Evening: { ledActive: boolean; color: string; pillCount: number };
    Night: { ledActive: boolean; color: string; pillCount: number };
  };
  physicalButtonPressed: boolean;
  buttonLastPressedAt?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface MedicalProfile {
  fullName: string;
  dateOfBirth: string;
  bloodType: string;
  primaryPhysician: string;
  physicianPhone: string;
  hospitalPreference: string;
  chronicConditions: string[];
  allergies: Array<{
    allergen: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    reaction: string;
  }>;
  insurancePolicyNumber?: string;
}

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  patientName?: string;
  phone?: string;
  emergencyEmail?: string;
  emergencyPhone?: string;
  password?: string;
  isVerified: boolean;
  avatarUrl?: string;
  provider?: 'email';
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'dose_reminder' | 'expiry_warning' | 'esp32_offline' | 'emergency_alert' | 'adherence_milestone';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
