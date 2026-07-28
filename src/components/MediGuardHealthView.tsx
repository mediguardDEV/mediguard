import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  AlertOctagon,
  User,
  Heart,
  FileText,
  Printer,
  History,
  Plus,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { EmergencyContact, MedicalProfile, DoseLog, UserSession } from '../types';

interface MediGuardHealthViewProps {
  emergencyContacts: EmergencyContact[];
  medicalProfile: MedicalProfile;
  doseLogs: DoseLog[];
  user?: UserSession | null;
  onOpenAuthModal?: () => void;
  onSaveContact: (contact: EmergencyContact) => void;
  onSaveProfile: (profile: MedicalProfile) => void;
}

export const MediGuardHealthView: React.FC<MediGuardHealthViewProps> = ({
  emergencyContacts,
  medicalProfile,
  doseLogs,
  user,
  onOpenAuthModal,
  onSaveContact,
  onSaveProfile,
}) => {
  const [activeCallMsg, setActiveCallMsg] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSimulateCall = (name: string, phone: string) => {
    setActiveCallMsg(`Triggering Emergency Alert to ${name} (${phone})... SOS Dispatch Signal Sent!`);
    setTimeout(() => setActiveCallMsg(''), 4000);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    if (!contactName || !contactPhone) return;
    onSaveContact({
      id: `em-${Date.now()}`,
      name: contactName,
      relationship: contactRelation || 'Emergency Contact',
      phone: contactPhone,
      isPrimary: false,
    });
    setIsAddingContact(false);
    setContactName('');
    setContactRelation('');
    setContactPhone('');
  };

  const handlePrintICECard = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              Emergency & Health Vault
            </span>
          </div>
          <h1 className="text-3xl font-black">MediGuard Health & SOS Hub</h1>
          <p className="text-rose-100 text-xs sm:text-sm max-w-xl">
            Instant 1-tap emergency dispatch contacts, severe allergy warnings, and print-ready ICE medical profile.
          </p>
        </div>

        <button
          onClick={handlePrintICECard}
          className="px-5 py-3 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-extrabold text-sm shadow-md transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-rose-600" />
          <span>Print ICE Medical Card</span>
        </button>
      </div>

      {activeCallMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl font-bold text-sm flex items-center gap-3 animate-bounce">
          <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <span>{activeCallMsg}</span>
        </div>
      )}

      {/* ONE-TAP EMERGENCY CONTACTS SECTION */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-black text-slate-900">One-Tap Emergency Contacts</h2>
            </div>
            <p className="text-xs text-slate-500">
              Direct connection to primary caregivers, physicians, and emergency dispatch.
            </p>
          </div>

          <button
            onClick={() => setIsAddingContact(true)}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Emergency Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {emergencyContacts.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <PhoneCall className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Emergency Contacts Added</p>
              <p className="text-[11px] text-slate-500">Click 'Add Emergency Contact' above to add caregivers or doctors.</p>
            </div>
          ) : (
            emergencyContacts.map((contact) => (
              <div
                key={contact.id}
                className="p-5 rounded-2xl border border-slate-200/90 hover:border-rose-300 bg-slate-50/50 space-y-4 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      {contact.relationship}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{contact.name}</h3>
                    <p className="text-xs text-slate-600 font-medium">{contact.phone}</p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleSimulateCall(contact.name, contact.phone)}
                    className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={() => handleSimulateCall(contact.name, contact.phone)}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>SMS SOS</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ALLERGIES & MEDICAL PROFILE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (6 cols): Allergy Information */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-black text-slate-900">Allergies & Sensitivities</h2>
          </div>

          <div className="space-y-4">
            {medicalProfile.allergies.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No known drug or environmental allergies logged.</p>
            ) : (
              medicalProfile.allergies.map((alg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{alg.allergen}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          alg.severity === 'Severe'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {alg.severity} Reaction
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">Reaction Details: {alg.reaction}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (6 cols): Medical Profile Card */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-black text-slate-900">Patient ICE Medical Profile</h2>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
              {medicalProfile.bloodType || 'Not Specified'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Full Name:</span>
              <span className="font-bold text-slate-900">{medicalProfile.fullName || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Date of Birth:</span>
              <span className="font-bold text-slate-900">{medicalProfile.dateOfBirth || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Primary Physician:</span>
              <span className="font-bold text-slate-900">{medicalProfile.primaryPhysician || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Preferred Hospital:</span>
              <span className="font-bold text-slate-900">{medicalProfile.hospitalPreference || 'Not Provided'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Chronic Conditions:</span>
              <span className="font-bold text-slate-900">
                {medicalProfile.chronicConditions.length > 0 ? medicalProfile.chronicConditions.join(', ') : 'None logged'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-medium">Insurance Policy ID:</span>
              <span className="font-mono font-bold text-slate-900">{medicalProfile.insurancePolicyNumber || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPLETE MEDICINE HISTORY TIMELINE */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-black text-slate-900">Complete Intake Audit History</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">{doseLogs.length} Records</span>
        </div>

        <div className="space-y-3">
          {doseLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    log.status === 'taken' ? 'bg-teal-500' : log.status === 'missed' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                ></span>
                <div>
                  <p className="font-bold text-slate-900">{log.medicineName} ({log.dosage})</p>
                  <p className="text-slate-500">
                    Compartment: {log.compartment} • Scheduled: {log.scheduledTime}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`font-bold px-2.5 py-1 rounded-md uppercase text-[10px] ${
                    log.status === 'taken'
                      ? 'bg-teal-100 text-teal-800'
                      : log.status === 'missed'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {log.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ADD CONTACT MODAL */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Add Emergency Contact</h3>
              <button onClick={() => setIsAddingContact(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Dr. Robert Chen"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Relationship / Role</label>
                <input
                  type="text"
                  required
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="e.g. Cardiologist, Son, Caregiver"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm"
              >
                Save Emergency Contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
