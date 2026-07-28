import React from 'react';
import {
  ShieldAlert,
  Pill,
  Clock,
  Sparkles,
  ArrowRight,
  Cpu,
  CheckCircle,
  QrCode,
  Bell,
  HeartPulse,
  Lock,
  ChevronRight,
  Activity,
  Award,
} from 'lucide-react';
import { ESP32Status } from '../types';

interface HomePageProps {
  onNavigate: (view: 'home' | 'dashboard' | 'health' | 'manager' | 'analytics') => void;
  esp32Status: ESP32Status;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, esp32Status }) => {
  return (
    <div className="space-y-20 pb-16 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        {/* Soft Decorative Ambient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-400/20 via-teal-300/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Left Text Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E0F2FE] border border-blue-200 text-[#2563EB] text-xs font-bold shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-ping"></span>
                <Cpu className="w-4 h-4 text-[#2563EB]" />
                <span>NCSC Project — National Children's Science Congress</span>
              </div>

              {/* Slogan Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1E293B] tracking-tight leading-[1.1]">
                Never Miss <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[#2563EB] to-[#0D9488] bg-clip-text text-transparent">
                  a Dose Again.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-[#64748B] text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                MediGuard seamlessly connects your daily medicine routine with an intelligent ESP32 smart box.
                Get real-time LED compartment prompts, automatic expiry alerts, AI prescription scanning, and one-tap emergency safety.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('manager')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#1E293B] font-bold text-sm border border-[#E2E8F0] shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Learn More & Box Setup</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Feature Quick Badges */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-black text-slate-900">99.8%</p>
                  <p className="text-xs text-slate-500 font-medium">Schedule Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-sky-600">4 Slots</p>
                  <p className="text-xs text-slate-500 font-medium">ESP32 Compartments</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-teal-600">AES-256</p>
                  <p className="text-xs text-slate-500 font-medium">Encrypted Vault</p>
                </div>
              </div>
            </div>

            {/* Hero Right Graphic Column (ESP32 Live Smart Box Digital Display) */}
            <div className="lg:col-span-5 relative w-full">
              <div className="relative mx-auto w-full max-w-lg">
                {/* Main ESP32 Device Unit Card */}
                <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white shadow-2xl border border-slate-700/70 relative overflow-hidden space-y-5">
                  {/* Decorative Background Glows */}
                  <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/15 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/15 rounded-full blur-2xl pointer-events-none"></div>

                  {/* ESP32 Device Status Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                        <Cpu className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm tracking-wide text-white">ESP32 NCSC Smart Box</h3>
                        <p className="text-[11px] text-teal-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block"></span>
                          <span>Connected • {esp32Status.wifiSSID}</span>
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
                      AES-256
                    </span>
                  </div>

                  {/* 4 Interactive LED Compartments Grid */}
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    {[
                      { name: 'Morning', time: '08:00 AM', status: 'LED Active Prompt', active: true, badge: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300' },
                      { name: 'Afternoon', time: '01:00 PM', status: 'Standby', active: false, badge: 'from-sky-500/10 to-sky-600/5 border-slate-700/80 text-slate-400' },
                      { name: 'Evening', time: '06:00 PM', status: 'Standby', active: false, badge: 'from-purple-500/10 to-purple-600/5 border-slate-700/80 text-slate-400' },
                      { name: 'Night', time: '09:30 PM', status: 'Standby', active: false, badge: 'from-indigo-500/10 to-indigo-600/5 border-slate-700/80 text-slate-400' },
                    ].map((slot, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border bg-gradient-to-br ${slot.badge} flex flex-col justify-between space-y-2 relative overflow-hidden transition-all`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{slot.name}</span>
                          {slot.active ? (
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                            </span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-300 font-medium truncate">
                          {slot.status}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-sky-300">
                          {slot.time}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Next Dose Live Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        <Pill className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">Next Dose: Amoxicillin 500mg</p>
                        <p className="text-[10px] text-slate-400 truncate">Morning Slot • 08:00 AM Prompt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-xs font-bold tracking-widest text-sky-600 uppercase">
            Intelligent Healthcare Architecture
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Absolute Peace of Mind
          </h3>
          <p className="text-slate-600 text-sm sm:text-base">
            MediGuard blends hardware precision with modern software design to eliminate dose errors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => onNavigate('manager')}
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all cursor-pointer space-y-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">ESP32 Smart Box</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              4 lighted compartments (Morning, Afternoon, Evening, Night) with physical push-button feedback and Wi-Fi sync.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-sky-600 pt-2">
              <span>View Control Panel</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigate('manager')}
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-teal-300 shadow-xs hover:shadow-xl transition-all cursor-pointer space-y-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">AI Prescription Scan</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan medicine barcodes, QR codes, or prescription receipts with camera OCR powered by Gemini AI.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-teal-600 pt-2">
              <span>Scan Medicine</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigate('health')}
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-xl transition-all cursor-pointer space-y-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">One-Tap SOS Emergency</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly notify doctors, family caregivers, and emergency responders with complete medical allergy logs.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-600 pt-2">
              <span>Emergency Hub</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigate('analytics')}
            className="group bg-white p-6 rounded-3xl border border-slate-200/80 hover:border-blue-300 shadow-xs hover:shadow-xl transition-all cursor-pointer space-y-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Adherence Analytics</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive pie charts, line graphs, missed dose analysis, and copyable clinical reports for your physician.
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-600 pt-2">
              <span>View Analytics</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT NCSC (NATIONAL CHILDREN'S SCIENCE CONGRESS) PROJECT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-sky-100 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>NCSC National Children's Science Congress</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Empowering Community Healthcare Through Science & Innovation
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                MediGuard was conceptualized and developed as a flagship project for the <strong>National Children's Science Congress (NCSC)</strong>. Designed to solve real-world healthcare challenges in medication non-adherence among elderly and chronic care patients.
              </p>
            </div>
            <div className="flex-shrink-0 bg-gradient-to-tr from-[#2563EB] to-[#0D9488] text-white p-6 rounded-2xl text-center shadow-md">
              <p className="text-3xl font-black">NCSC</p>
              <p className="text-[11px] font-bold text-sky-100 uppercase tracking-widest mt-1">Science Congress Project</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Objective & Vision
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applying scientific methodology to create an accessible, low-cost smart medication dispenser with hardware LED feedback for rural and urban households.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                Community Health Impact
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reduces medical emergencies caused by missed or wrong doses, providing automated prescription OCR scanning and caregiver emergency SOS broadcasts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Child Innovation
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Demonstrates how young student researchers can blend embedded systems (ESP32), web architecture, and AI to solve critical public health issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS: ESP32 NCSC WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4 mb-10">
            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider">
              Smart Box Hardware Workflow
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              How MediGuard ESP32 Integration Works
            </h3>
            <p className="text-slate-300 text-sm">
              From scheduled cloud timings to hardware LED activation and physical confirmation.
            </p>
          </div>

          {/* Step Workflow Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-sky-500 text-white font-black flex items-center justify-center text-sm">
                1
              </span>
              <h4 className="font-bold text-base text-white">Schedule Cloud Sync</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Medicine timing created in the web app encrypts and syncs to the ESP32 micro-controller via Wi-Fi.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-teal-500 text-white font-black flex items-center justify-center text-sm">
                2
              </span>
              <h4 className="font-bold text-base text-white">LED Compartment Glow</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When dose time arrives, the target slot LED glows (Teal, Green, Amber, or Indigo) and buzzer sounds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black flex items-center justify-center text-sm">
                3
              </span>
              <h4 className="font-bold text-base text-white">Physical Confirmation</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Patient presses the physical confirmation button on the box after retrieving the pill.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm">
                4
              </span>
              <h4 className="font-bold text-base text-white">Adherence Logged</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Web app logs exact intake timestamp, updates stock counts, and clears active reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GET STARTED CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-tr from-sky-50 via-teal-50 to-blue-50 border border-sky-200/80 rounded-3xl p-10 sm:p-14 space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-white text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-sky-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Start organizing your medicines today. Connect your ESP32 smart box or manage schedules right from your web browser.
          </p>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base rounded-2xl shadow-lg transition-all hover:scale-105 inline-flex items-center gap-3"
          >
            <span>Go to Personal Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
