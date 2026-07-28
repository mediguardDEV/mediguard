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
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-[#E2E8F0] shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-base sm:text-xl font-bold text-[#2563EB] tracking-tight">
                  MediGuard
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#E0F2FE] text-[#2563EB] uppercase tracking-wider">
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
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Prominent Medicine Manager Button */}
            <button
              onClick={() => onNavigate('manager')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
                currentView === 'manager'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'bg-[#2563EB] hover:bg-blue-700 text-white'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Medicine </span>
              <span>Manager</span>
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
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 hover:bg-slate-100 p-1 sm:p-1.5 rounded-xl border border-slate-200 transition-all">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
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
                    className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar for Touch Devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg py-1 px-2 text-xs font-semibold flex items-center justify-around min-h-[52px]">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 rounded-lg transition-colors ${
            currentView === 'home' ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 rounded-lg transition-colors ${
            currentView === 'dashboard' ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate('manager')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 rounded-lg transition-colors ${
            currentView === 'manager' ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Manager</span>
        </button>
        <button
          onClick={() => onNavigate('health')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 rounded-lg transition-colors ${
            currentView === 'health' ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Health</span>
        </button>
        <button
          onClick={() => onNavigate('analytics')}
          className={`flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-1 rounded-lg transition-colors ${
            currentView === 'analytics' ? 'text-[#2563EB] font-bold bg-blue-50' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Analytics</span>
        </button>
      </div>
    </>
  );
};
