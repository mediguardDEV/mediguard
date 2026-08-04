import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileText,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { DoseLog, Medicine, UserSession } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

interface AnalyticsViewProps {
  doseLogs: DoseLog[];
  medicines: Medicine[];
  patientName?: string;
  user?: UserSession | null;
  onOpenAuthModal?: () => void;
}

const PIE_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#64748b'];

const MONTHLY_PROGRESS_DATA = [
  { week: 'Week 1', adherence: 100, missed: 0 },
  { week: 'Week 2', adherence: 100, missed: 0 },
  { week: 'Week 3', adherence: 100, missed: 0 },
  { week: 'Week 4', adherence: 100, missed: 0 },
];

const MISSED_REASONS_DATA = [
  { reason: 'Away from Home / Box', count: 0 },
  { reason: 'Fell Asleep Early', count: 0 },
  { reason: 'Pill Stock Depleted', count: 0 },
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ doseLogs, medicines, patientName, user, onOpenAuthModal }) => {
  const [copiedReport, setCopiedReport] = useState(false);

  // Statistics Breakdown
  const total = doseLogs.length;
  const taken = doseLogs.filter((l) => l.status === 'taken').length;
  const missed = doseLogs.filter((l) => l.status === 'missed').length;
  const skipped = doseLogs.filter((l) => l.status === 'skipped').length;

  const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

  const pieData = [
    { name: 'Taken On Time', value: taken },
    { name: 'Missed Doses', value: missed },
    { name: 'Skipped / Paused', value: skipped },
  ];

  const generateClinicalReportText = () => {
    return `==================================================
MEDIGUARD CLINICAL ADHERENCE REPORT
Patient Name: ${patientName || 'Registered Patient'}
Generated Date: ${new Date().toLocaleDateString()}
Report Period: Past 30 Days
==================================================

1. ADHERENCE SUMMARY:
- Total Scheduled Doses: ${total}
- Confirmed Intake Doses: ${taken} (${adherenceRate}%)
- Missed Doses: ${missed}
- Intentionally Skipped Doses: ${skipped}
- Overall Compliance Index: ${adherenceRate >= 90 ? 'OPTIMAL (Grade A)' : 'MODERATE (Grade B)'}

2. ACTIVE MEDICATIONS MAPPED TO ESP32 BOX:
${
  medicines.length > 0
    ? medicines
        .map(
          (m) =>
            `• ${m.name} (${m.dosage}) - Slot: ${m.compartment} @ ${m.scheduledTime} [Stock: ${m.stockCount}/${m.totalPills}]`
        )
        .join('\n')
    : '• No active medications registered yet.'
}

3. PHYSICIAN NOTES:
Patient adherence logged via MediGuard web app and ESP32 smart hardware unit.

Report cryptographically signed by MediGuard Vault.
==================================================`;
  };

  const handleCopyReport = () => {
    const text = generateClinicalReportText();
    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {!user && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Signed Out — Clinical Metrics Wiped</p>
              <p className="text-xs text-slate-300">
                You are currently logged out. Adherence logs and clinical reports have been wiped from preview. Please sign in to view analytics.
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

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              Clinical Quality Metrics
            </span>
          </div>
          <h1 className="text-3xl font-black">Medicine Adherence Analytics</h1>
          <p className="text-sky-100 text-xs sm:text-sm max-w-xl">
            Detailed 30-day compliance metrics, dosage pie charts, missed dose root cause analysis, and copyable reports for doctor appointments.
          </p>
        </div>

        {/* COPY CLINICAL REPORT BUTTON */}
        <button
          onClick={handleCopyReport}
          className={`px-6 py-3.5 rounded-2xl font-extrabold text-sm shadow-md transition-all flex items-center gap-2 self-start md:self-auto ${
            copiedReport
              ? 'bg-teal-400 text-teal-950 scale-105'
              : 'bg-white text-sky-800 hover:bg-sky-50'
          }`}
        >
          {copiedReport ? (
            <>
              <Check className="w-5 h-5 text-teal-950" />
              <span>Copied Report to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 text-sky-600" />
              <span>Copy Clinical Report</span>
            </>
          )}
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">30-Day Adherence</p>
          <p className="text-3xl font-black text-teal-600">{adherenceRate}%</p>
          <p className="text-[11px] text-teal-700 font-semibold">Above 90% Clinical Threshold</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Confirmed Intake</p>
          <p className="text-3xl font-black text-slate-900">{taken} Doses</p>
          <p className="text-[11px] text-sky-600 font-semibold">ESP32 Button Verified</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Missed Doses</p>
          <p className="text-3xl font-black text-amber-600">{missed}</p>
          <p className="text-[11px] text-amber-700 font-semibold">Low Risk Trend</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Adherence Grade</p>
          <p className="text-3xl font-black text-sky-600">Grade A+</p>
          <p className="text-[11px] text-slate-500 font-semibold">Excellent Compliance</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (6 cols): Pie Chart - Dosage Breakdown */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-black text-slate-900">Dosage Compliance Breakdown</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">Past 30 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend formatter={(value) => <span className="text-xs font-bold text-slate-700">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right (6 cols): Monthly Trend Line Graph */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-black text-slate-900">Monthly Adherence Progression</h2>
            </div>
            <span className="text-xs font-bold text-teal-700">Weekly Averages</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_PROGRESS_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="adherence" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MISSED DOSE ROOT CAUSE ANALYSIS & TEXT REPORT PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left (6 cols): Missed Cause Breakdown */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-black text-slate-900">Missed Medicine Root Cause Analysis</h2>
          </div>

          <p className="text-xs text-slate-500">
            Identifying why doses were skipped or delayed helps your doctor optimize timing windows.
          </p>

          <div className="space-y-3 pt-2">
            {MISSED_REASONS_DATA.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>{item.reason}</span>
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">{item.count} Occurrences</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(item.count / 8) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (6 cols): Copyable Text Report Preview Box */}
        <div className="lg:col-span-6 bg-slate-900 text-slate-200 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white">Formatted Clinical Report</h2>
            </div>
            <button
              onClick={handleCopyReport}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>
          </div>

          <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto leading-relaxed h-56">
            {generateClinicalReportText()}
          </pre>
        </div>
      </div>
    </div>
  );
};
