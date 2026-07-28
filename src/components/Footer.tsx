import React from 'react';
import { ShieldAlert, Heart, Mail, Github, Twitter, Linkedin, Lock, Cpu, Globe } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onNavigate: (view: 'home' | 'dashboard' | 'health' | 'manager' | 'analytics') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms, onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-400 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">MediGuard</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              MediGuard is an intelligent healthcare innovation for the National Children's Science Congress (NCSC), bridging smart ESP32 hardware with encrypted cloud synchronization, AI vision medicine scanning, and real-time dosage adherence tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-sky-400 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                ESP32 NCSC Hardware
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-teal-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                NCSC Science Congress Project
              </span>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-sky-400 transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-sky-400 transition-colors">
                  Personal Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('manager')} className="hover:text-sky-400 transition-colors">
                  Medicine Manager
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('health')} className="hover:text-sky-400 transition-colors">
                  MediGuard Health & SOS
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-sky-400 transition-colors">
                  Adherence Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Legal & Privacy</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-sky-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="hover:text-sky-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">HIPAA & RLS Compliance</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">ESP32 Firmware License</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Support & Social */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Support & Connect</h4>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:supportcentremediguard@gmail.com"
                className="flex items-center gap-2 text-slate-300 hover:text-sky-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-sky-400" />
                <span>supportcentremediguard@gmail.com</span>
              </a>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#github"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="#twitter"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#linkedin"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#website"
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  aria-label="Global Web"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar with mandatory credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MediGuard NCSC (National Children's Science Congress) Project. All rights reserved.</p>
          <div className="flex items-center gap-2 font-semibold text-slate-300 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by</span>
            <span className="text-sky-400 font-bold">Team MediGuard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
