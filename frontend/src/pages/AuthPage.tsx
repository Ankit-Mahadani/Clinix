import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

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
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-[#3B4EF8]', 'bg-emerald-500'];

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EEF2F6] p-4 sm:p-8 font-sans antialiased text-[#1E2438]">
      {/* Floating Neumorphic Card */}
      <div className="w-full max-w-md rounded-[36px] bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(20,30,65,0.08)] border border-white/80 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF2FC] text-[#3B4EF8] shadow-xs">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#1E2438]">
            Mour<span className="text-[#3B4EF8] font-normal text-xs ml-1 bg-[#EEF2FC] px-2 py-0.5 rounded-full">clinic</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Healthcare Management & Clinical Operations</p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-full bg-[#F6F8FB] p-1 border border-slate-100">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
              mode === 'login'
                ? 'bg-white text-[#3B4EF8] shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
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
            className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
              mode === 'register'
                ? 'bg-white text-[#3B4EF8] shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Jordan Henderson"
                  className="w-full rounded-2xl border border-slate-200/80 bg-[#F6F8FB] py-2.5 pl-10 pr-4 text-xs font-medium text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Practitioner Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@meditrack.com"
                className="w-full rounded-2xl border border-slate-200/80 bg-[#F6F8FB] py-2.5 pl-10 pr-4 text-xs font-medium text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-2xl border border-slate-200/80 bg-[#F6F8FB] py-2.5 pl-10 pr-10 text-xs font-medium text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password strength meter for registration */}
            {mode === 'register' && password && (
              <div className="mt-2 space-y-1">
                <div className="flex h-1 w-full gap-1 overflow-hidden rounded-full bg-slate-100">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 transition-all ${
                        step < strength ? strengthColors[strength] : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 text-right">
                  Strength: <span className="font-semibold text-slate-700">{strengthLabels[strength]}</span>
                </div>
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-slate-200/80 bg-[#F6F8FB] py-2.5 pl-10 pr-4 text-xs font-medium text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] py-3 text-xs font-bold text-white shadow-md shadow-[#3B4EF8]/25 active:scale-98 transition-all disabled:opacity-50 mt-1 cursor-pointer"
          >
            {loading
              ? 'Verifying...'
              : mode === 'login'
              ? 'Sign In to Clinical Suite'
              : 'Complete Registration'}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#EEF2FC] hover:bg-[#E2EAFA] text-[#3B4EF8] text-xs font-bold transition-all shadow-xs group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3B4EF8]" />
              <span>One-Click Demo (demo@meditrack.com)</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B4EF8] text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </button>
          <p className="mt-2 text-center text-[10px] text-slate-400 font-medium">
            Pre-seeded with 15 patients, 10 specialists, and primary care mappings.
          </p>
        </div>
      </div>
    </div>
  );
};
