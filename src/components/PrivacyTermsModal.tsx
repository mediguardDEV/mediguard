import React from 'react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';

interface PrivacyTermsModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            {type === 'privacy' ? <ShieldCheck className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {type === 'privacy' ? 'MediGuard Privacy Policy' : 'Terms of Service'}
            </h2>
            <p className="text-xs text-slate-500">Effective Date: July 2026 • MediGuard Health Systems</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>1. Encrypted Health Data Storage:</strong> All patient medical schedules, prescription images, emergency contact details, and medication history are encrypted using AES-256 at rest and TLS 1.3 in transit.
              </p>
              <p>
                <strong>2. Row Level Security (RLS):</strong> MediGuard utilizes strict encrypted database Row Level Security policies. Only authenticated user accounts can access or modify their personal medication records.
              </p>
              <p>
                <strong>3. ESP32 Hardware Communication:</strong> Telemetry transmitted between the web platform and the ESP32 micro-controller (such as Wi-Fi status, battery levels, and LED compartment confirmations) is cryptographically signed and never shared with third-party advertising networks.
              </p>
              <p className="pt-2 text-slate-500 border-t border-slate-100">
                For privacy inquiries or data requests, contact our team at{' '}
                <a href="mailto:supportcentremediguard@gmail.com" className="text-sky-600 underline font-medium">
                  supportcentremediguard@gmail.com
                </a>.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Medical Disclaimer:</strong> MediGuard is an assistive medication management tool designed to aid schedule adherence and smart box hardware synchronization. It is not a replacement for professional medical advice, clinical diagnosis, or emergency dispatch services.
              </p>
              <p>
                <strong>2. User Responsibility:</strong> Users are responsible for verifying medication dosages, pill compartments, and expiry dates before consumption.
              </p>
              <p>
                <strong>3. Hardware Pairing:</strong> The ESP32 smart medicine box operates over Wi-Fi/Bluetooth. Uninterrupted connectivity depends on local network status.
              </p>
              <p className="pt-2 text-slate-500 border-t border-slate-100">
                For support or service inquiries, contact our support team at{' '}
                <a href="mailto:supportcentremediguard@gmail.com" className="text-sky-600 underline font-medium">
                  supportcentremediguard@gmail.com
                </a>.
              </p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
};
