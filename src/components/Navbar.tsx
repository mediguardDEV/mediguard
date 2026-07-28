import React from 'react';
import {
  ShieldAlert,
  Activity,
  Box,
  LayoutDashboard,
  Home,
  Wifi,
  WifiOff,
  User,
  LogOut,
  Pill,
  Sparkles,
} from 'lucide-react';
import { UserSession, ESP32Status } from '../types';

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'health' | 'manager' | 'analytics';
  onNavigate: (view: 'home' | 'dashboard' | 'health' | 'manager' | 'analytics') => void;
  user: UserSession | null;
  esp32Status: ESP32Status;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  esp32Status,
  onOpenAuthModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-[#E2E8F0] shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-[#2563EB] tracking-tight">
                MediGuard
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E0F2FE] text-[#2563EB] uppercase tracking-wider">
                NCSC Project
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-[#2563EB]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'dashboard'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-[#2563EB]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('health')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'health'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-[#2563EB]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            MediGuard Health
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'analytics'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-[#2563EB]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>

        {/* Right Actions & ESP32 Pill */}
        <div className="flex items-center gap-3">
          {/* Prominent Medicine Manager Button */}
          <button
            onClick={() => onNavigate('manager')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
              currentView === 'manager'
                ? 'bg-[#2563EB] text-white shadow-md'
                : 'bg-[#2563EB] hover:bg-blue-700 text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medicine Manager</span>
          </button>

          {/* ESP32 Status Pill */}
          <div
            onClick={() => onNavigate('manager')}
            title={`ESP32 Box: ${esp32Status.isConnected ? 'Connected' : 'Disconnected'} (${esp32Status.wifiSSID})`}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
              esp32Status.isConnected
                ? 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            {esp32Status.isConnected ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden xl:inline">ESP32 Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Auth Button / Avatar */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-xl border border-slate-200 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden xl:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{user.fullName}</p>
                  <p className="text-[10px] text-teal-600 font-semibold">
                    {user.isVerified ? 'Verified Account' : 'Pending Auth'}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all hover:shadow-lg"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50/90 py-2 px-2 text-xs font-semibold">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 ${currentView === 'home' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-0.5 ${currentView === 'dashboard' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onNavigate('health')}
          className={`flex flex-col items-center gap-0.5 ${currentView === 'health' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <Activity className="w-4 h-4" />
          Health
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className={`flex flex-col items-center gap-0.5 ${currentView === 'analytics' ? 'text-sky-600 font-bold' : 'text-slate-500'}`}
        >
          <Sparkles className="w-4 h-4" />
          Analytics
        </button>
      </div>
    </header>
  );
};
