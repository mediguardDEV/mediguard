import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Phone,
  AlertCircle,
  HeartPulse,
  Database,
  Link2,
  RefreshCw,
  Key,
} from 'lucide-react';
import { UserSession } from '../types';
import {
  loginUserInDatabase,
  registerUserInDatabase,
  sendSupabasePasswordReset,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient,
} from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset' | 'config'>('signin');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup State
  const [patientName, setPatientName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyEmail, setEmergencyEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Supabase Config State
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'unconfigured' | 'error'>('unconfigured');
  const [configMsg, setConfigMsg] = useState('');

  // Status & Error
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setSbUrl(creds.url);
      setSbKey(creds.key);
      checkSupabaseConnection(creds.url, creds.key);
    }
  }, [isOpen]);

  const checkSupabaseConnection = async (urlStr: string, keyStr: string) => {
    if (!urlStr || !keyStr) {
      setConnectionStatus('unconfigured');
      setConfigMsg('Supabase URL or Key is empty. Operating in local sandbox mode.');
      return;
    }
    setConnectionStatus('testing');
    try {
      saveSupabaseCredentials(urlStr, keyStr);
      const client = getSupabaseClient();
      if (!client) {
        setConnectionStatus('error');
        setConfigMsg('Failed to initialize Supabase client.');
        return;
      }
      const { error } = await client.auth.getSession();
      if (error) {
        setConnectionStatus('error');
        setConfigMsg(`Connection test error: ${error.message}`);
      } else {
        setConnectionStatus('connected');
        setConfigMsg('Successfully connected to Supabase Auth & Database!');
      }
    } catch (err: unknown) {
      setConnectionStatus('error');
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setConfigMsg(`Connection error: ${msg}`);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    checkSupabaseConnection(sbUrl.trim(), sbKey.trim());
  };

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoading(true);

    try {
      const user = await loginUserInDatabase(email, password);
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(msg);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMsg(null);
    setIsLoading(true);

    try {
      const { user, confirmationNeeded } = await registerUserInDatabase({
        email,
        fullName: fullName || patientName,
        patientName: patientName || fullName,
        phone,
        emergencyEmail,
        emergencyPhone,
        password,
      });
      setIsLoading(false);

      if (confirmationNeeded) {
        setAuthSuccessMsg(`Registration initiated! A confirmation email has been dispatched by Supabase to ${email}. Please check your inbox or spam folder to complete activation.`);
      } else {
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setAuthError(msg);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      await sendSupabasePasswordReset(email);
      setIsLoading(false);
      setResetSent(true);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Password reset failed';
      setAuthError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn my-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 relative my-auto">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-teal-300" />
            <span className="font-extrabold tracking-wide text-lg">MediGuard Account Vault</span>
          </div>
          <p className="text-sky-100 text-xs">
            Encrypted Health Authentication & Supabase Database
          </p>

          {/* Connection Status Pill Header */}
          <div className="mt-3 flex items-center justify-between bg-black/20 px-3 py-1.5 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : connectionStatus === 'testing'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-amber-300'
                }`}
              ></span>
              <span className="font-medium text-[11px] text-white">
                {connectionStatus === 'connected'
                  ? 'Supabase Live Connected'
                  : connectionStatus === 'testing'
                  ? 'Testing Supabase...'
                  : 'Supabase Config / Sandbox'}
              </span>
            </div>
            <button
              onClick={() => {
                setTab('config');
                setAuthError(null);
              }}
              className="text-[11px] font-bold text-teal-200 hover:text-white flex items-center gap-1 underline"
            >
              <Database className="w-3 h-3" />
              <span>Config Keys</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-3 bg-black/20 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setTab('signin');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                tab === 'signin' ? 'bg-white text-sky-800 shadow-sm font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setAuthError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                tab === 'signup' ? 'bg-white text-sky-800 shadow-sm font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setTab('config');
                setAuthError(null);
              }}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                tab === 'config' ? 'bg-white text-sky-800 shadow-sm font-bold' : 'text-white/80 hover:text-white'
              }`}
            >
              Supabase Keys
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Error Banner */}
          {authError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{authError}</p>
                {authError.toLowerCase().includes('not registered') && (
                  <button
                    onClick={() => {
                      setTab('signup');
                      setAuthError(null);
                    }}
                    className="mt-2 px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-[11px] hover:bg-rose-700 transition-colors"
                  >
                    Click here to Sign Up
                  </button>
                )}
                {authError.toLowerCase().includes('already registered') && (
                  <button
                    onClick={() => {
                      setTab('signin');
                      setAuthError(null);
                    }}
                    className="mt-2 px-3 py-1 bg-sky-600 text-white rounded-lg font-bold text-[11px] hover:bg-sky-700 transition-colors"
                  >
                    Click here to Sign In
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {authSuccessMsg && (
            <div className="mb-5 p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-800">
              <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold text-teal-900">Email Confirmation Sent</p>
                <p>{authSuccessMsg}</p>
              </div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('reset');
                      setAuthError(null);
                    }}
                    className="text-xs text-sky-600 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setAuthError(null);
                    }}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SIGN UP FORM WITH ALL MANDATORY USER QUESTIONS */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl mb-1">
                <p className="text-xs text-sky-800 font-semibold flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-sky-600" />
                  <span>Register Patient & Emergency Details</span>
                </p>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Patient Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    placeholder="e.g. John Doe (Patient)"
                  />
                </div>
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Account Holder / Caregiver Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    placeholder="e.g. Mary Doe"
                  />
                </div>
              </div>

              {/* Main Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Main Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Main Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                      placeholder="+1 (555) 019-2834"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Info Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Emergency Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-teal-600 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={emergencyEmail}
                      onChange={(e) => setEmergencyEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium bg-slate-50/50"
                      placeholder="emergency@family.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Emergency Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-teal-600 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium bg-slate-50/50"
                      placeholder="+1 (555) 911-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all mt-3"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Complete Registration & Sign In'
                )}
              </button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signin');
                      setAuthError(null);
                    }}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {tab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Reset Password</h3>
              <p className="text-xs text-slate-500">
                Enter your main email address to receive a password reset token from Supabase Auth.
              </p>

              {resetSent ? (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Reset Email Sent!</span>
                  </div>
                  <p>A reset link was sent to {email}. Check your inbox and spam folder.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSent(false);
                      setTab('signin');
                    }}
                    className="text-sky-700 font-bold underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Main Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Send Reset Email
                  </button>
                </>
              )}
            </form>
          )}

          {/* SUPABASE CONNECTION CONFIG TAB */}
          {tab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-2 text-xs text-teal-900">
                <Database className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Supabase Project Connection Keys</p>
                  <p className="text-slate-600 mt-0.5">
                    Provide your Supabase URL & Anon Key below to send real Auth emails and persist data directly into your Supabase database.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="url"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Supabase Anon Key (Public)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <textarea
                    rows={3}
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono resize-none"
                  />
                </div>
              </div>

              {configMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : connectionStatus === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  {configMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save Keys & Connect</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Back to Auth
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

