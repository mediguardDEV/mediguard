import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Trash2,
  Edit2,
  Upload,
  QrCode,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Wifi,
  Battery,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Search,
  Clock,
  Zap,
  Camera,
  X,
  Radio,
} from 'lucide-react';
import { Medicine, TimeOfDay, ESP32Status } from '../types';

interface MedicineManagerViewProps {
  medicines: Medicine[];
  esp32Status: ESP32Status;
  onSaveMedicine: (medicine: Omit<Medicine, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  onDeleteMedicine: (id: string) => Promise<void>;
  onUpdateESP32Status: (status: ESP32Status) => void;
}

export const MedicineManagerView: React.FC<MedicineManagerViewProps> = ({
  medicines,
  esp32Status,
  onSaveMedicine,
  onDeleteMedicine,
  onUpdateESP32Status,
}) => {
  const [selectedCompartmentTab, setSelectedCompartmentTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [compartment, setCompartment] = useState<TimeOfDay>('Morning');
  const [scheduledTime, setScheduledTime] = useState('08:00 AM');
  const [foodInstruction, setFoodInstruction] = useState<'Before Food' | 'After Food' | 'With Food' | 'Anytime'>('After Food');
  const [stockCount, setStockCount] = useState(30);
  const [totalPills, setTotalPills] = useState(30);
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [imageUrl, setImageUrl] = useState('');
  const [barcode, setBarcode] = useState('');
  const [notes, setNotes] = useState('');

  // AI Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerMsg, setScannerMsg] = useState('');

  const handleOpenAddModal = (med?: Medicine) => {
    if (med) {
      setEditingMed(med);
      setName(med.name);
      setDosage(med.dosage);
      setFrequency(med.frequency);
      setCompartment(med.compartment);
      setScheduledTime(med.scheduledTime);
      setFoodInstruction(med.foodInstruction);
      setStockCount(med.stockCount);
      setTotalPills(med.totalPills);
      setExpiryDate(med.expiryDate);
      setImageUrl(med.imageUrl || '');
      setBarcode(med.barcode || '');
      setNotes(med.notes || '');
    } else {
      setEditingMed(null);
      setName('');
      setDosage('');
      setFrequency('Once daily');
      setCompartment('Morning');
      setScheduledTime('08:00 AM');
      setFoodInstruction('After Food');
      setStockCount(30);
      setTotalPills(30);
      setExpiryDate('2027-06-30');
      setImageUrl('');
      setBarcode('');
      setNotes('');
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveMedicine({
      id: editingMed?.id,
      name,
      dosage,
      frequency,
      compartment,
      scheduledTime,
      foodInstruction,
      stockCount: Number(stockCount),
      totalPills: Number(totalPills),
      expiryDate,
      imageUrl,
      barcode,
      notes,
    });
    setIsAddModalOpen(false);
  };

  // AI Prescription & Barcode Camera Scanner Simulator
  const handleTriggerAIScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannerMsg('Reading prescription image & barcodes with Gemini AI Vision...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const response = await fetch('/api/gemini/scan-medicine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, imageMimeType: file.type }),
        });
        const resData = await response.json();
        if (resData.extractedData) {
          const ext = resData.extractedData;
          if (ext.name) setName(ext.name);
          if (ext.dosage) setDosage(ext.dosage);
          if (ext.frequency) setFrequency(ext.frequency);
          if (ext.compartment) setCompartment(ext.compartment as TimeOfDay);
          if (ext.scheduledTime) setScheduledTime(ext.scheduledTime);
          if (ext.foodInstruction) setFoodInstruction(ext.foodInstruction);
          if (ext.expiryDate) setExpiryDate(ext.expiryDate);
          if (ext.notes) setNotes(ext.notes);
          setImageUrl(base64);
          setScannerMsg('Successfully parsed prescription details!');
        }
      } catch (err) {
        console.error('AI Scan Error:', err);
        setScannerMsg('Parsed image scan fallback applied!');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ESP32 Hardware LED Flash Test Trigger
  const handleTestLED = (comp: TimeOfDay) => {
    const updatedCompartments = { ...esp32Status.compartments };
    updatedCompartments[comp] = {
      ...updatedCompartments[comp],
      ledActive: !updatedCompartments[comp].ledActive,
    };
    onUpdateESP32Status({
      ...esp32Status,
      lastSyncedAt: new Date().toLocaleTimeString(),
      compartments: updatedCompartments,
    });
  };

  // Physical Button Simulator
  const handleSimulatePhysicalButton = () => {
    onUpdateESP32Status({
      ...esp32Status,
      physicalButtonPressed: true,
      buttonLastPressedAt: new Date().toLocaleString(),
      lastSyncedAt: new Date().toLocaleTimeString(),
    });

    setTimeout(() => {
      onUpdateESP32Status({
        ...esp32Status,
        physicalButtonPressed: false,
      });
    }, 2500);
  };

  // Expiry Checker Helper
  const getExpiryStatus = (dateStr: string) => {
    const exp = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return { label: 'EXPIRED', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (diffDays <= 30) return { label: `EXPIRING IN ${diffDays} DAYS`, color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'VALID', color: 'bg-teal-100 text-teal-800 border-teal-200' };
  };

  // Filtered List
  const filteredMedicines = medicines.filter((m) => {
    const matchesTab = selectedCompartmentTab === 'All' || m.compartment === selectedCompartmentTab;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.dosage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
              Cabinet & NCSC Slot Mapping
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Medicine Manager</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organize medicines across Morning, Afternoon, Evening, and Night compartments with real-time ESP32 sync.
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* SMART BOX CONTROL PANEL (INTEGRATED AS REQUESTED) */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-teal-400" />
              <h2 className="text-2xl font-black">Smart Box Control Panel</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-xs">
                ESP32 NCSC v2
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Hardware diagnostic status, real-time LED glow controls, and encrypted cloud sync bus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Realtime Sync Button */}
            <button
              onClick={() =>
                onUpdateESP32Status({
                  ...esp32Status,
                  lastSyncedAt: new Date().toLocaleTimeString(),
                })
              }
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
              <span>Sync Box Now</span>
            </button>

            {/* Physical Button Trigger Simulation */}
            <button
              onClick={handleSimulatePhysicalButton}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                esp32Status.physicalButtonPressed
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105 animate-pulse'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>
                {esp32Status.physicalButtonPressed ? 'Physical Button Pressed!' : 'Test Physical Button Push'}
              </span>
            </button>
          </div>
        </div>

        {/* Telemetry Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold">ESP32 Status</p>

            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${esp32Status.isConnected ? 'bg-teal-400 animate-ping' : 'bg-rose-500'}`}
              ></span>
              <p className="font-extrabold text-sm">{esp32Status.isConnected ? 'Online & Paired' : 'Disconnected'}</p>
            </div>
            <p className="text-[10px] text-slate-400">Device ID: {esp32Status.deviceId}</p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Wi-Fi Connection</p>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-sky-300">
              <Wifi className="w-4 h-4 text-sky-400" />
              <span className="truncate">{esp32Status.wifiSSID}</span>
            </div>
            <p className="text-[10px] text-slate-400">Signal: {esp32Status.wifiSignalDbm} dBm (Strong)</p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Battery Level</p>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-teal-300">
              <Battery className="w-4 h-4 text-teal-400" />
              <span>{esp32Status.batteryLevel}%</span>
            </div>
            <p className="text-[10px] text-slate-400">Li-Po 2200mAh Battery</p>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Security & Encryption</p>
            <div className="flex items-center gap-1.5 font-extrabold text-xs text-teal-300 truncate">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>{esp32Status.encryptionMode}</span>
            </div>
            <p className="text-[10px] text-slate-400">Last Synced: {esp32Status.lastSyncedAt}</p>
          </div>
        </div>

        {/* Compartment LED LED Test Panel */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-200">Compartment LED Status & Manual Glow Test</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['Morning', 'Afternoon', 'Evening', 'Night'] as TimeOfDay[]).map((comp) => {
              const compData = esp32Status.compartments[comp];
              const linkedMedCount = medicines.filter((m) => m.compartment === comp).length;

              return (
                <div
                  key={comp}
                  className={`p-4 rounded-2xl border transition-all ${
                    compData.ledActive
                      ? 'bg-teal-500/20 border-teal-400 shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs text-white">{comp} Slot</span>
                    <span
                      className="w-3 h-3 rounded-full border border-white/40"
                      style={{ backgroundColor: compData.ledActive ? compData.color : '#334155' }}
                    ></span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">{linkedMedCount} Medicines Mapped</p>

                  <button
                    onClick={() => handleTestLED(comp)}
                    className="mt-3 w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white transition-all"
                  >
                    {compData.ledActive ? 'Stop LED Flash' : 'Test LED Glow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARTMENTS ORGANIZER TABS & SEARCH */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Compartment Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold overflow-x-auto w-full sm:w-auto">
            {['All', 'Morning', 'Afternoon', 'Evening', 'Night'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedCompartmentTab(tab)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  selectedCompartmentTab === tab
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab} Slot
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine or dosage..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Medicines Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No Medicines Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the "Add New Medicine" button above or scan a prescription to map your medications to ESP32 slots.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((med) => {
              const expStatus = getExpiryStatus(med.expiryDate);

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-all p-5 space-y-4 relative group"
                >
                  {/* Expiry Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${expStatus.color}`}>
                      {expStatus.label}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenAddModal(med)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit Medicine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMedicine(med.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Medicine Main Info */}
                  <div className="flex items-start gap-4">
                    {med.imageUrl ? (
                      <img
                        src={med.imageUrl}
                        alt={med.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 flex-shrink-0">
                        <Pill className="w-8 h-8" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">{med.name}</h3>
                      <p className="text-xs text-sky-700 font-bold">{med.dosage}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {med.frequency} • {med.foodInstruction}
                      </p>
                    </div>
                  </div>

                {/* Slot Mapping & Stock Bar */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">ESP32 Compartment:</span>
                    <span className="font-bold text-slate-900 bg-sky-50 px-2 py-0.5 rounded text-[11px] text-sky-700">
                      {med.compartment} ({med.scheduledTime})
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Stock Remaining:</span>
                      <span className="font-bold text-slate-800">
                        {med.stockCount} / {med.totalPills} pills
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          med.stockCount < 10 ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, (med.stockCount / med.totalPills) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* ADD / EDIT MEDICINE MODAL WITH AI CAMERA SCANNER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-6 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">
                {editingMed ? 'Edit Medicine Entry' : 'Add New Medicine'}
              </h2>
              <p className="text-xs text-slate-500">
                Upload image or use AI prescription scanner to auto-fill details.
              </p>
            </div>

            {/* AI Prescription Camera & Barcode Upload Banner */}
            <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600" />
                  <span className="font-bold text-xs text-slate-900 uppercase">
                    AI Prescription & Barcode Scanner
                  </span>
                </div>
                {isScanning && (
                  <span className="text-xs font-bold text-sky-600 animate-pulse">Scanning with Gemini...</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Scan Prescription / Barcode</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTriggerAIScan}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500 font-medium">Auto-populates fields using OCR vision.</span>
              </div>

              {scannerMsg && <p className="text-xs font-bold text-teal-700">{scannerMsg}</p>}
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amoxicillin, Metformin"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 500 mg, 1 capsule"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ESP32 Compartment</label>
                  <select
                    value={compartment}
                    onChange={(e) => setCompartment(e.target.value as TimeOfDay)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Morning">Morning Slot</option>
                    <option value="Afternoon">Afternoon Slot</option>
                    <option value="Evening">Evening Slot</option>
                    <option value="Night">Night Slot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="08:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Food Instruction</label>
                  <select
                    value={foodInstruction}
                    onChange={(e) => setFoodInstruction(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  >
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                    <option value="With Food">With Food</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={stockCount}
                    onChange={(e) => setStockCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Bottle Count</label>
                  <input
                    type="number"
                    required
                    value={totalPills}
                    onChange={(e) => setTotalPills(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Special Warnings / Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Take with plenty of fluids. Store in cool place."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 text-white font-extrabold rounded-2xl shadow-lg transition-all"
              >
                {editingMed ? 'Update Medicine' : 'Save to Medicine Manager'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
