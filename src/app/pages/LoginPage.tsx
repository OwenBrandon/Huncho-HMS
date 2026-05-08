import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Building2, Shield, Eye, EyeOff, AlertCircle, CheckCircle2,
  Zap, Users, BarChart3, Bell, ArrowRight, Loader2
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@hostel.com', color: 'bg-lime-400 text-black' },
  { role: 'Warden', email: 'warden@hostel.com', color: 'bg-white/10 text-white' },
  { role: 'Student', email: 'john.doe@student.com', color: 'bg-white/10 text-white' },
  { role: 'Finance', email: 'finance@hostel.com', color: 'bg-white/10 text-white' },
  { role: 'Security', email: 'security@hostel.com', color: 'bg-white/10 text-white' },
  { role: 'Maintenance', email: 'maintenance@hostel.com', color: 'bg-white/10 text-white' },
  { role: 'Auditor', email: 'auditor@hostel.com', color: 'bg-white/10 text-white' },
];

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'warden', label: 'Warden' },
  { value: 'maintenance_staff', label: 'Maintenance Staff' },
  { value: 'finance_officer', label: 'Finance Officer' },
  { value: 'security', label: 'Security' },
  { value: 'auditor', label: 'Auditor' },
];

const FEATURES = [
  { icon: <Zap className="h-4 w-4 text-lime-400" />, text: 'Real-time Operational Intelligence' },
  { icon: <Users className="h-4 w-4 text-lime-400" />, text: 'Multi-Role Access Control' },
  { icon: <BarChart3 className="h-4 w-4 text-lime-400" />, text: 'Forensic Fiscal Analytics' },
  { icon: <Bell className="h-4 w-4 text-lime-400" />, text: 'Live Complaint & Incident Tracking' },
  { icon: <Shield className="h-4 w-4 text-lime-400" />, text: 'Enterprise-Grade Security' },
];

export function LoginPage() {
  const { login } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Register state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);
    try {
      await login(email, password);
    } catch {
      setLoginError('Invalid credentials. Check your email and password.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError('Password must be at least 8 characters.');
      return;
    }

    setIsRegLoading(true);
    try {
      // Pass profile data as auth metadata — picked up by DB trigger or admin endpoint
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regFullName,
            role: regRole,
            phone_number: regPhone || null,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Account creation failed.');

      // Sign out immediately — user must log in manually after profile is provisioned
      await supabase.auth.signOut();

      setRegSuccess('✅ Account created! Check your email and click the confirmation link before signing in.');

      setRegFullName(''); setRegEmail(''); setRegPassword(''); setRegConfirmPassword(''); setRegPhone(''); setRegRole('student');
      setTab('login');
      setEmail(regEmail);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-lime-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-16 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-lime-400 rounded-2xl flex items-center justify-center shadow-xl shadow-lime-500/20">
            <Building2 className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight uppercase italic">Landmark</p>
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">HMS · Institutional Platform</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-10">
          <div>
            <h1 className="text-6xl font-black text-white uppercase italic tracking-tight leading-none">
              Intelligent<br />
              <span className="text-lime-400">Hostel</span><br />
              Operations
            </h1>
            <p className="mt-6 text-white/40 text-sm font-medium leading-relaxed max-w-sm">
              A unified command center for institutional hostel management — from fiscal intelligence to real-time incident resolution.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-sm font-semibold text-white/60">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
          © 2026 Landmark, Inc. — All systems operational.
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="h-10 w-10 bg-lime-400 rounded-xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-black" />
          </div>
          <span className="text-white font-black text-lg uppercase italic tracking-tight">Landmark HMS</span>
        </div>

        <div className="w-full max-w-md">
          {/* Tab Switcher */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-8">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                  tab === t
                    ? 'bg-lime-400 text-black shadow-lg shadow-lime-500/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Welcome Back</h2>
                <p className="text-white/40 text-sm font-medium mt-1">Access your institutional terminal.</p>
              </div>

              {loginError && (
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <p className="text-rose-300 text-xs font-bold">{loginError}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@hostel.com"
                    required
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white placeholder-white/20 font-medium focus:outline-none focus:border-lime-400/60 focus:bg-white/8 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-5 pr-14 text-sm text-white placeholder-white/20 font-medium focus:outline-none focus:border-lime-400/60 focus:bg-white/8 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full h-14 bg-lime-400 hover:bg-lime-300 disabled:opacity-60 text-black font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-lime-500/25 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoginLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Access Terminal <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              {/* Demo Accounts */}
              <div className="pt-2">
                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest text-center mb-4">
                  Demo Quick-Access · Password: <span className="text-lime-400/60">demo123</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => { setEmail(acc.email); setPassword('demo123'); }}
                      className={`py-2.5 px-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${acc.color} border border-white/10`}
                    >
                      {acc.role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">Create Account</h2>
                <p className="text-white/40 text-sm font-medium mt-1">Join the institutional platform.</p>
              </div>

              {regError && (
                <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                  <p className="text-rose-300 text-xs font-bold">{regError}</p>
                </div>
              )}
              {regSuccess && (
                <div className="flex items-center gap-3 p-4 bg-lime-500/10 border border-lime-500/20 rounded-2xl">
                  <CheckCircle2 className="h-4 w-4 text-lime-400 flex-shrink-0" />
                  <p className="text-lime-300 text-xs font-bold">{regSuccess}</p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white placeholder-white/20 font-medium focus:outline-none focus:border-lime-400/60 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white placeholder-white/20 font-medium focus:outline-none focus:border-lime-400/60 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Phone</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+234 801..."
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white placeholder-white/20 font-medium focus:outline-none focus:border-lime-400/60 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Role</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 text-sm text-white font-medium focus:outline-none focus:border-lime-400/60 transition-all appearance-none cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#1a1a1a] text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 chars"
                        required
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl px-5 pr-12 text-sm text-white placeholder-white/20 font-medium focus:outline-none focus:border-lime-400/60 transition-all"
                      />
                      <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70">
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Confirm</label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className={`w-full h-12 bg-white/5 border rounded-2xl px-5 text-sm text-white placeholder-white/20 font-medium focus:outline-none transition-all ${
                        regConfirmPassword && regPassword !== regConfirmPassword
                          ? 'border-rose-500/50 focus:border-rose-500'
                          : 'border-white/10 focus:border-lime-400/60'
                      }`}
                    />
                  </div>
                </div>

                {/* Password strength indicator */}
                {regPassword && (
                  <div className="flex gap-1">
                    {[1,2,3,4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all ${
                        regPassword.length >= level * 3
                          ? level <= 2 ? 'bg-rose-500' : level === 3 ? 'bg-amber-500' : 'bg-lime-400'
                          : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegLoading}
                  className="w-full h-14 bg-lime-400 hover:bg-lime-300 disabled:opacity-60 text-black font-black text-sm uppercase tracking-widest rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-lime-500/25 hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isRegLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Register Account <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <p className="text-center text-white/25 text-[10px] font-bold uppercase tracking-widest">
                Already registered?{' '}
                <button onClick={() => setTab('login')} className="text-lime-400/70 hover:text-lime-400 transition-colors">
                  Sign In
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
