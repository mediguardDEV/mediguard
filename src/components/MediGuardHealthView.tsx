import React, { useState, useEffect } from 'react';
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
  Edit3,
  Trash2,
  Lock,
  ShieldCheck,
  Stethoscope,
  Building2,
  Save,
  UserCheck,
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
  const [successToast, setSuccessToast] = useState('');

  // Add Contact Modal State
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRelation, setContactRelation] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Edit Patient ICE Medical Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<MedicalProfile>({ ...medicalProfile });
  const [newCondition, setNewCondition] = useState('');
  const [newAllergen, setNewAllergen] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [newReaction, setNewReaction] = useState('');

  // Synchronize profile form when medicalProfile changes or modal opens
  useEffect(() => {
    setProfileForm({ ...medicalProfile });
  }, [medicalProfile]);

  const handleSimulateCall = (name: string, phone: string) => {
    setActiveCallMsg(`Triggering Emergency Alert to ${name} (${phone})... SOS Dispatch Signal Sent!`);
    setTimeout(() => setActiveCallMsg(''), 4000);
  };

  const handleOpenProfileEditor = () => {
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    setProfileForm({
      fullName: medicalProfile.fullName || user.fullName || '',
      dateOfBirth: medicalProfile.dateOfBirth || '',
      bloodType: medicalProfile.bloodType || 'A+',
      primaryPhysician: medicalProfile.primaryPhysician || '',
      physicianPhone: medicalProfile.physicianPhone || '',
      hospitalPreference: medicalProfile.hospitalPreference || '',
      chronicConditions: medicalProfile.chronicConditions || [],
      allergies: medicalProfile.allergies || [],
      insurancePolicyNumber: medicalProfile.insurancePolicyNumber || '',
    });
    setIsEditingProfile(true);
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setProfileForm((prev) => ({
      ...prev,
      chronicConditions: [...prev.chronicConditions, newCondition.trim()],
    }));
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== index),
    }));
  };

  const handleAddAllergy = () => {
    if (!newAllergen.trim()) return;
    setProfileForm((prev) => ({
      ...prev,
      allergies: [
        ...prev.allergies,
        {
          allergen: newAllergen.trim(),
          severity: newSeverity,
          reaction: newReaction.trim() || 'No specific reaction noted',
        },
      ],
    }));
    setNewAllergen('');
    setNewReaction('');
    setNewSeverity('Moderate');
  };

  const handleRemoveAllergy = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    onSaveProfile(profileForm);
    setIsEditingProfile(false);
    setSuccessToast('Patient ICE Medical Profile updated successfully!');
    setTimeout(() => setSuccessToast(''), 4000);
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
    setSuccessToast('Emergency contact added successfully!');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const handlePrintICECard = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {!user && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/30 text-rose-400 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Signed Out — Health Vault Cleared</p>
              <p className="text-xs text-slate-300">
                You are currently logged out. Emergency contacts and ICE medical profiles have been wiped from preview. Please sign in to access your health vault.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex-shrink-0"
          >
            Sign In to Account
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Emergency & Health Vault</span>
            </span>
          </div>
          <h1 className="text-3xl font-black">MediGuard Health & SOS Hub</h1>
          <p className="text-rose-100 text-xs sm:text-sm max-w-xl">
            Instant 1-tap emergency dispatch contacts, severe allergy warnings, and print-ready ICE medical profile.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {user && (
            <button
              onClick={handleOpenProfileEditor}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-teal-400" />
              <span>Edit ICE Medical Profile</span>
            </button>
          )}

          <button
            onClick={handlePrintICECard}
            className="px-5 py-3 rounded-2xl bg-white text-rose-800 hover:bg-rose-50 font-extrabold text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>Print ICE Medical Card</span>
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="p-4 bg-teal-50 border border-teal-300 text-teal-900 rounded-2xl font-bold text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* LOGGED OUT PRIVACY PROTECTION BANNER */}
      {!user && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/40">
                  Data Protection Enforced
                </span>
              </div>
              <h3 className="text-lg font-black">Logged Out — Patient Data Cleared</h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                For patient confidentiality and HIPAA compliance, all emergency medical profiles, caregiver contact lists, and medication logs are automatically wiped and hidden when logged out. Please sign in to view or update your Patient ICE Medical Profile.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal()}
            className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2 self-stretch sm:self-auto justify-center whitespace-nowrap"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In to Access Your Health Vault</span>
          </button>
        </div>
      )}

      {/* ACTIVE CALL / SOS DISPATCH ALERT */}
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
            onClick={() => {
              if (!user) {
                if (onOpenAuthModal) onOpenAuthModal();
              } else {
                setIsAddingContact(true);
              }
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Emergency Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {!user || emergencyContacts.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <PhoneCall className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">
                {!user ? 'No Active User Session' : 'No Emergency Contacts Configured'}
              </p>
              <p className="text-[11px] text-slate-500">
                {!user
                  ? 'Sign in to sync your saved emergency caregivers and doctor contacts.'
                  : "Click 'Add Emergency Contact' above to add caregivers or doctors."}
              </p>
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-black text-slate-900">Allergies & Sensitivities</h2>
            </div>
            {user && (
              <button
                onClick={handleOpenProfileEditor}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!user || medicalProfile.allergies.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                {!user ? 'Sign in to view allergy profile.' : 'No known drug or environmental allergies logged.'}
              </p>
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
                            : alg.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                {user ? medicalProfile.bloodType || 'Not Specified' : 'Hidden'}
              </span>
              <button
                onClick={handleOpenProfileEditor}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {!user ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <Lock className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">Patient ICE Medical Profile Hidden</p>
              <p>Sign in to configure physician contacts, insurance policy, and conditions.</p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Full Name:</span>
                <span className="font-bold text-slate-900">
                  {medicalProfile.fullName || user?.fullName || 'Not Provided'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Date of Birth:</span>
                <span className="font-bold text-slate-900">{medicalProfile.dateOfBirth || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Primary Physician:</span>
                <span className="font-bold text-slate-900">
                  {medicalProfile.primaryPhysician
                    ? `${medicalProfile.primaryPhysician} (${medicalProfile.physicianPhone || 'No Phone'})`
                    : 'Not Provided'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Preferred Hospital:</span>
                <span className="font-bold text-slate-900">{medicalProfile.hospitalPreference || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Chronic Conditions:</span>
                <span className="font-bold text-slate-900">
                  {medicalProfile.chronicConditions && medicalProfile.chronicConditions.length > 0
                    ? medicalProfile.chronicConditions.join(', ')
                    : 'None logged'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">Insurance Policy ID:</span>
                <span className="font-mono font-bold text-slate-900">
                  {medicalProfile.insurancePolicyNumber || 'N/A'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPLETE MEDICINE HISTORY TIMELINE */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-black text-slate-900">Complete Intake Audit History</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">{user ? doseLogs.length : 0} Records</span>
        </div>

        <div className="space-y-3">
          {!user || doseLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              {!user ? 'Sign in to view dose logs.' : 'No medication logs recorded yet.'}
            </p>
          ) : (
            doseLogs.map((log) => (
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
                    <p className="font-bold text-slate-900">
                      {log.medicineName} ({log.dosage})
                    </p>
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
            ))
          )}
        </div>
      </section>

      {/* EDIT PATIENT ICE MEDICAL PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-100">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Patient ICE Medical Profile Editor</h3>
                  <p className="text-xs text-slate-400">Update emergency health details for account: {user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
              {/* General Personal Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-teal-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <User className="w-4 h-4" />
                  <span>General Patient Information</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Patient Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      placeholder="e.g. Johnathan Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dateOfBirth}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Blood Type</label>
                    <select
                      value={profileForm.bloodType}
                      onChange={(e) => setProfileForm({ ...profileForm, bloodType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Not Specified">Not Specified / Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Insurance Policy ID / Number
                    </label>
                    <input
                      type="text"
                      value={profileForm.insurancePolicyNumber || ''}
                      onChange={(e) => setProfileForm({ ...profileForm, insurancePolicyNumber: e.target.value })}
                      placeholder="e.g. POL-99201182"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Care Team */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-sky-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Medical Care Team & Hospital</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Physician</label>
                    <input
                      type="text"
                      value={profileForm.primaryPhysician}
                      onChange={(e) => setProfileForm({ ...profileForm, primaryPhysician: e.target.value })}
                      placeholder="e.g. Dr. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Physician Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.physicianPhone}
                      onChange={(e) => setProfileForm({ ...profileForm, physicianPhone: e.target.value })}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Preferred Hospital / Trauma Center
                    </label>
                    <input
                      type="text"
                      value={profileForm.hospitalPreference}
                      onChange={(e) => setProfileForm({ ...profileForm, hospitalPreference: e.target.value })}
                      placeholder="e.g. St. Jude General Medical Center"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-rose-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Heart className="w-4 h-4" />
                  <span>Chronic Medical Conditions</span>
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCondition();
                      }
                    }}
                    placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {profileForm.chronicConditions.map((cond, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <span>{cond}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="text-rose-500 hover:text-rose-800"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergies Editor */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-700 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Allergies & Sensitivities</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <input
                    type="text"
                    value={newAllergen}
                    onChange={(e) => setNewAllergen(e.target.value)}
                    placeholder="Allergen (e.g. Penicillin)"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                  <input
                    type="text"
                    value={newReaction}
                    onChange={(e) => setNewReaction(e.target.value)}
                    placeholder="Reaction (e.g. Anaphylaxis)"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="sm:col-span-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
                  >
                    + Add Allergy to Profile
                  </button>
                </div>

                <div className="space-y-2">
                  {profileForm.allergies.map((alg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900">{alg.allergen}</span>{' '}
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px]">
                          {alg.severity}
                        </span>
                        <p className="text-[11px] text-slate-600">{alg.reaction}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(idx)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Patient ICE Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Relationship / Role</label>
                <input
                  type="text"
                  required
                  value={contactRelation}
                  onChange={(e) => setContactRelation(e.target.value)}
                  placeholder="e.g. Cardiologist, Caregiver, Spouse"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium"
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
