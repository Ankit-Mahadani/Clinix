import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Lock, Mail, User, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, demoLogin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculatePasswordStrength(password);
  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-teal-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== password2) {
          throw new Error('Passwords do not match');
        }
        await register(name, email, password, password2);
      }
      navigate('/');
    } catch (err: any) {
      const errResponse = err.response?.data;
      if (errResponse?.error?.message) {
        setError(errResponse.error.message);
      } else if (errResponse?.error?.details) {
        const details = errResponse.error.details;
        const firstKey = Object.keys(details)[0];
        const val = details[firstKey];
        setError(`${firstKey}: ${Array.isArray(val) ? val[0] : val}`);
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with demo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 text-white selection:bg-teal-500 selection:text-white">
      {/* Left Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.25),rgba(255,255,255,0))]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/30">
            <HeartPulse className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              Medi<span className="text-teal-400">Track</span>
            </span>
            <p className="text-xs text-teal-300 font-medium tracking-wide">CLINICAL SUITE</p>
          </div>
        </div>

        {/* Hero Narrative */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>Healthcare ERP & Patient Management</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-slate-50 sm:text-5xl">
            Precision clinical workflows for modern medicine.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Uncompromising privacy, isolated practitioner records, primary care coordination, and instant audit trails backed by Django REST Framework and JWT security.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Owner-isolated records</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Primary doctor enforcement</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>HIPAA-aligned audit trail</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0" />
              <span>Full OpenAPI 3.0 specs</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500">
          MediTrack Core Clinical Platform © 2026. Production-Ready Enterprise Backend.
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-slate-950 shadow-md">
              <HeartPulse className="h-6 w-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Medi<span className="text-teal-400">Track</span>
            </span>
          </div>

          {/* Auth Card */}
          <div className="rounded-3xl p-8 shadow-2xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-xl">
            {/* Tab switch */}
            <div className="flex rounded-xl bg-slate-800/90 p-1 mb-6 border border-slate-700/60">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  mode === 'login'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  mode === 'register'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 rounded-xl bg-rose-950/60 p-3 text-xs font-medium text-rose-300 border border-rose-800/60">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Jordan Henderson"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Practitioner Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@meditrack.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength meter for registration */}
                {mode === 'register' && password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex h-1 w-full gap-1 overflow-hidden rounded-full bg-slate-800">
                      {[0, 1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 transition-all ${
                            step < strength ? strengthColors[strength] : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      Strength: <span className="font-semibold text-slate-300">{strengthLabels[strength]}</span>
                    </div>
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/30 hover:bg-teal-500 active:scale-98 transition-all disabled:opacity-50 mt-2"
              >
                {loading
                  ? 'Verifying...'
                  : mode === 'login'
                  ? 'Sign In to Clinical Suite'
                  : 'Complete Registration'}
              </button>
            </form>

            {/* Quick Demo Access */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <button
                type="button"
                onClick={handleDemoClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-950/80 border-2 border-teal-500/70 hover:border-teal-400 hover:bg-teal-900/90 py-3 px-4 text-xs font-bold text-teal-200 active:scale-98 transition-all shadow-md group cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-teal-300 group-hover:scale-110 transition-transform shrink-0" />
                <span className="tracking-wide">One-Click Demo Login (demo@meditrack.com)</span>
              </button>
              <p className="mt-2.5 text-center text-xs font-medium text-slate-400">
                Pre-seeded with 15 patients, 10 specialists, and primary care mappings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
