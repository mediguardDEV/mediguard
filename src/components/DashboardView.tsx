import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pill,
  TrendingUp,
  Bell,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Wifi,
  Battery,
  Filter,
} from 'lucide-react';
import { Medicine, DoseLog, ESP32Status, AppNotification } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  medicines: Medicine[];
  doseLogs: DoseLog[];
  esp32Status: ESP32Status;
  notifications: AppNotification[];
  onUpdateDoseStatus: (logId: string, status: 'taken' | 'missed' | 'skipped', reason?: string) => void;
  onNavigate: (view: 'home' | 'dashboard' | 'health' | 'manager' | 'analytics') => void;
}

const ADHERENCE_PROGRESS_DATA = [
  { day: 'Mon', adherence: 100 },
  { day: 'Tue', adherence: 85 },
  { day: 'Wed', adherence: 100 },
  { day: 'Thu', adherence: 90 },
  { day: 'Fri', adherence: 100 },
  { day: 'Sat', adherence: 75 },
  { day: 'Sun', adherence: 95 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  medicines,
  doseLogs,
  esp32Status,
  notifications,
  onUpdateDoseStatus,
  onNavigate,
}) => {
  const [activeCompartmentFilter, setActiveCompartmentFilter] = useState<string>('All');
  const [selectedSkipLogId, setSelectedSkipLogId] = useState<string | null>(null);
  const [skipReasonInput, setSkipReasonInput] = useState<string>('');

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = doseLogs.filter((l) => l.date === todayStr);
  const takenCount = todayLogs.filter((l) => l.status === 'taken').length;
  const missedCount = todayLogs.filter((l) => l.status === 'missed').length;
  const pendingCount = todayLogs.filter((l) => l.status === 'pending').length;
  const totalCount = todayLogs.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  const filteredTodayLogs = todayLogs.filter((log) => {
    if (activeCompartmentFilter === 'All') return true;
    return log.compartment === activeCompartmentFilter;
  });

  const handleSkipSubmit = (logId: string) => {
    if (!skipReasonInput.trim()) return;
    onUpdateDoseStatus(logId, 'skipped', skipReasonInput);
    setSelectedSkipLogId(null);
    setSkipReasonInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Personalized Header Banner */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#0D9488] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">MediGuard Smart Dashboard</h1>
            <p className="text-sky-100 text-xs sm:text-sm max-w-xl">
              Track and log daily doses in real-time. Synced directly with your ESP32 Smart Box.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('manager')}
              className="px-5 py-2.5 rounded-xl bg-white text-[#2563EB] hover:bg-slate-50 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Pill className="w-4 h-4 text-[#2563EB]" />
              <span>Medicine Manager</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Adherence */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Adherence</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{adherencePercent}%</p>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">
              {takenCount} of {totalCount} completed
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Pending Doses */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Doses</p>
            <p className="text-3xl font-black text-sky-600 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-sky-600 font-semibold mt-1">Next: Afternoon Compartment</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Missed Doses Alert */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missed Doses</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{missedCount}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">Requires Attention</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Smart Box Hardware */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ESP32 Smart Box</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-lg font-extrabold text-slate-900">Connected</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
              <span className="flex items-center gap-0.5">
                <Wifi className="w-3 h-3 text-teal-600" /> {esp32Status.wifiSignalDbm} dBm
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Battery className="w-3 h-3 text-teal-600" /> {esp32Status.batteryLevel}%
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Missed Doses Banner Alert (If Any) */}
      {missedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Missed Dose Detected</p>
              <p className="text-xs text-amber-700">
                You missed a dose scheduled for yesterday. Log a catch-up or review details in Analytics.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Resolve Missed Log</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Today's Schedule + Notifications & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Today's Medicine Schedule */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900">Today's Medicine Schedule</h2>
                <p className="text-xs text-slate-500">
                  Interactive real-time intake verification connected with ESP32 compartments.
                </p>
              </div>

              {/* Compartment Filter Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                {['All', 'Morning', 'Afternoon', 'Evening', 'Night'].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setActiveCompartmentFilter(comp)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      activeCompartmentFilter === comp
                        ? 'bg-white text-sky-800 shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule List Items */}
            <div className="space-y-4">
              {filteredTodayLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">No doses scheduled for this compartment filter.</p>
                </div>
              ) : (
                filteredTodayLogs.map((log) => {
                  const med = medicines.find((m) => m.id === log.medicineId);

                  return (
                    <div
                      key={log.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        log.status === 'taken'
                          ? 'bg-teal-50/50 border-teal-200'
                          : log.status === 'missed'
                          ? 'bg-amber-50/50 border-amber-200'
                          : log.status === 'skipped'
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                      }`}
                    >
                      {/* Left Details */}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            log.status === 'taken'
                              ? 'bg-teal-500 text-white'
                              : log.status === 'missed'
                              ? 'bg-amber-500 text-white'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          <Pill className="w-6 h-6" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-base">{log.medicineName}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {log.dosage}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                              {log.compartment} Slot
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-sky-600" /> {log.scheduledTime}
                            </span>
                            {med?.foodInstruction && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600">
                                {med.foodInstruction}
                              </span>
                            )}
                            {log.loggedAt && (
                              <span className="text-teal-700 font-bold">Logged at {log.loggedAt}</span>
                            )}
                            {log.reasonIfMissed && (
                              <span className="text-rose-600 italic">Reason: {log.reasonIfMissed}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2">
                        {log.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onUpdateDoseStatus(log.id, 'taken')}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Take Dose</span>
                            </button>

                            <button
                              onClick={() => setSelectedSkipLogId(log.id)}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
                            >
                              Skip
                            </button>
                          </>
                        )}

                        {log.status === 'taken' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-100 text-teal-800 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>Verified Intake</span>
                          </span>
                        )}

                        {log.status === 'missed' && (
                          <button
                            onClick={() => onUpdateDoseStatus(log.id, 'taken')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
                          >
                            Mark Taken Late
                          </button>
                        )}

                        {log.status === 'skipped' && (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl">
                            Skipped
                          </span>
                        )}
                      </div>

                      {/* Modal/Drawer inline for skip reason */}
                      {selectedSkipLogId === log.id && (
                        <div className="w-full mt-3 p-3 bg-slate-100 rounded-xl space-y-2">
                          <label className="block text-xs font-bold text-slate-700">Reason for skipping dose:</label>
                          <input
                            type="text"
                            value={skipReasonInput}
                            onChange={(e) => setSkipReasonInput(e.target.value)}
                            placeholder="e.g. Fasting, Physician advised pause, Side effect"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedSkipLogId(null)}
                              className="px-3 py-1 text-xs text-slate-600 font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSkipSubmit(log.id)}
                              className="px-3 py-1 bg-slate-800 text-white font-bold text-xs rounded-lg"
                            >
                              Confirm Skip
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Health Progress Chart Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Weekly Health Adherence Trend</h3>
                <p className="text-xs text-slate-500">7-day intake compliance history</p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
              >
                <span>Full Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ADHERENCE_PROGRESS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="adherence"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Smart Notifications & Upcoming Reminders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Feed */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Smart Notifications</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {notifications.length} Active
              </span>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 text-xs">{notif.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hardware Status Card */}
          <div className="bg-gradient-to-tr from-slate-900 to-sky-950 text-white rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold uppercase">
                ESP32 NCSC Sync
              </span>
              <span className="text-xs text-slate-400">ID: {esp32Status.deviceId}</span>
            </div>

            <div className="space-y-2">
              <p className="text-lg font-extrabold">Smart Medicine Box</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-[10px]">Wi-Fi Network</p>
                  <p className="font-bold text-sky-300 truncate">{esp32Status.wifiSSID}</p>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <p className="text-slate-400 text-[10px]">Battery Charge</p>
                  <p className="font-bold text-teal-300">{esp32Status.batteryLevel}% Ready</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('manager')}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all"
            >
              Open ESP32 Control Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
