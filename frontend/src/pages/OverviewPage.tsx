import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardStats, Doctor } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Heart,
  Calendar as CalendarIcon,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'chat' | 'doctors'>('info');

  // Calendar State
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          api.dashboard.stats(),
          api.doctors.list({ page_size: 4 }),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (docsRes.success && docsRes.data) {
          const list = (docsRes.data as any).results || docsRes.data || [];
          setDoctors(Array.isArray(list) ? list.slice(0, 4) : []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const kpis = stats?.kpis || {
    total_patients: 15,
    total_doctors: 10,
    active_mappings: 17,
    unassigned_patients: 0,
  };

  // Calendar days generation
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Days 1 through 31
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col xl:flex-row gap-6 animate-in fade-in duration-300">
      {/* Center Column: Tabs, 3 Hero Cards, Lower 2 Sub-Cards */}
      <div className="flex-1 flex flex-col space-y-6">
        {/* Navigation Tabs (Info, Chat, Doctor page) */}
        <div className="flex items-center gap-8 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('info')}
            className={`text-sm font-bold relative pb-2 transition-colors ${
              activeTab === 'info'
                ? 'text-[#1E2438] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3B4EF8] after:rounded-full'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`text-sm font-bold relative pb-2 transition-colors ${
              activeTab === 'chat'
                ? 'text-[#1E2438] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3B4EF8] after:rounded-full'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => {
              setActiveTab('doctors');
              navigate('/doctors');
            }}
            className={`text-sm font-bold relative pb-2 transition-colors ${
              activeTab === 'doctors'
                ? 'text-[#1E2438] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#3B4EF8] after:rounded-full'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Doctor page
          </button>
        </div>

        {/* Top 3 Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: My Consultation (White Card) */}
          <Link
            to="/patients"
            className="group rounded-[28px] bg-white border border-slate-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-between text-center min-h-[220px]"
          >
            {/* Medical Stethoscope & Clipboard Illustration */}
            <div className="flex h-24 w-24 items-center justify-center">
              <svg className="h-20 w-20 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none">
                <rect x="22" y="16" width="56" height="72" rx="12" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5" />
                <rect x="36" y="10" width="28" height="12" rx="4" fill="#3B4EF8" />
                <line x1="32" y1="36" x2="68" y2="36" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="32" y1="48" x2="68" y2="48" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="32" y1="60" x2="54" y2="60" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                {/* Cute stethoscope wrapped around */}
                <path d="M72 40 C78 40, 84 48, 84 56 C84 68, 72 74, 56 74" stroke="#F43F5E" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="54" cy="74" r="5" fill="#F43F5E" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E2438]">My consultation</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {loading ? '...' : `${kpis.total_patients} consultations`}
              </p>
            </div>
          </Link>

          {/* Card 2: Tests & Lab (Pastel Blue Card) */}
          <Link
            to="/doctors"
            className="group rounded-[28px] bg-[#F0F4FE] border border-[#E0E9FE] p-5 hover:shadow-md transition-all flex flex-col items-center justify-between text-center min-h-[220px]"
          >
            {/* X-ray / Medical Folder Illustration */}
            <div className="flex h-24 w-24 items-center justify-center">
              <svg className="h-20 w-20 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none">
                <rect x="18" y="24" width="46" height="60" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
                <rect x="34" y="16" width="48" height="62" rx="8" fill="#1E293B" />
                {/* Lungs / X-ray ribs inside dark folder */}
                <path d="M48 34 C44 40, 44 54, 50 60" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M68 34 C72 40, 72 54, 66 60" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="58" y1="28" x2="58" y2="64" stroke="#94A3B8" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E2438]">Tests & Specialists</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {loading ? '...' : `${kpis.total_doctors} results available`}
              </p>
            </div>
          </Link>

          {/* Card 3: Clinic Reports (Solid Royal Blue Card) */}
          <Link
            to="/mappings"
            className="group rounded-[28px] bg-[#3B4EF8] p-5 shadow-lg shadow-[#3B4EF8]/25 hover:shadow-xl transition-all flex flex-col items-center justify-between text-center min-h-[220px] text-white"
          >
            {/* White Band-Aid Cross Badge Illustration */}
            <div className="flex h-24 w-24 items-center justify-center">
              <svg className="h-20 w-20 transform group-hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none">
                {/* Crossed band-aids with polka dots */}
                <rect x="18" y="42" width="64" height="18" rx="9" transform="rotate(-30 50 50)" fill="#FFFFFF" fillOpacity="0.95" />
                <rect x="18" y="42" width="64" height="18" rx="9" transform="rotate(30 50 50)" fill="#FFFFFF" fillOpacity="0.95" />
                {/* Inner center square */}
                <rect x="42" y="42" width="16" height="16" rx="4" fill="#F87171" fillOpacity="0.8" />
                <circle cx="28" cy="46" r="1.5" fill="#CBD5E1" />
                <circle cx="72" cy="54" r="1.5" fill="#CBD5E1" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Clinic reports</h3>
              <p className="text-[11px] text-white/80 font-medium mt-0.5">
                {loading ? '...' : `${kpis.active_mappings} reports active`}
              </p>
            </div>
          </Link>
        </div>

        {/* Lower Split: Community Quick Assignment Card & View All Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Left Sub-card: Community / Quick Assignment */}
          <div className="rounded-[28px] bg-white border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-5">
            <div>
              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
                Community Care
              </span>
              <h4 className="text-base font-bold text-[#1E2438] mt-1 leading-snug">
                Join to our medicine volunteer care team
              </h4>
            </div>

            {/* 2x2 Specs Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Place</span>
                <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                  <CalendarIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>Monday</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
                <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>3 pm</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Goals</span>
                <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  <span>Help patients</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Condition</span>
                <div className="flex items-center gap-1.5 font-bold text-[#1E2438]">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Primary doctor</span>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <Link
              to="/mappings"
              className="w-full py-2.5 rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] text-white text-xs font-bold text-center shadow-md shadow-[#3B4EF8]/20 transition-all active:scale-98 block"
            >
              Assign Care Team
            </Link>
          </div>

          {/* Right Sub-card: View all Schedule */}
          <div className="rounded-[28px] bg-white border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#1E2438]">View all schedule</h4>
              <button
                onClick={() => navigate('/doctors')}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Doctor Rows */}
            <div className="space-y-3">
              {doctors.length > 0 ? (
                doctors.map((doc, idx) => {
                  const avatarGradients = [
                    'from-rose-400 to-pink-500',
                    'from-blue-400 to-indigo-500',
                    'from-amber-400 to-orange-500',
                    'from-emerald-400 to-teal-500',
                  ];
                  return (
                    <Link
                      key={doc.id}
                      to="/doctors"
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#F6F8FB] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full bg-gradient-to-tr ${
                            avatarGradients[idx % avatarGradients.length]
                          } text-white font-bold text-xs flex items-center justify-center shadow-xs`}
                        >
                          {doc.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1E2438]">{doc.specialization}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{doc.name}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#3B4EF8] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })
              ) : (
                <div className="text-xs text-slate-400 py-6 text-center">
                  Loading active clinical schedules...
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <Link
                to="/doctors"
                className="text-xs font-bold text-[#3B4EF8] hover:underline inline-flex items-center gap-1"
              >
                <span>Full catalog</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Mini-Calendar Widget & Doctor Illustration */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col justify-between space-y-6">
        {/* Mini-Calendar Card */}
        <div className="rounded-[28px] bg-white border border-slate-100 p-5 shadow-xs">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-bold text-[#1E2438]">
                {currentMonthName} {currentYear}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-1 hover:text-slate-700">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="p-1 hover:text-slate-700">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 uppercase mb-2">
            {daysOfWeek.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* 7x5 Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {calendarDays.map((day) => {
              // Highlight special days with badges like in reference image
              if (day === 2) {
                return (
                  <div key={day} className="flex items-center justify-center py-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500 font-bold border border-rose-200">
                      {day}
                    </span>
                  </div>
                );
              }
              if (day === 18) {
                return (
                  <div key={day} className="flex items-center justify-center py-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3B4EF8] text-white font-bold shadow-xs">
                      {day}
                    </span>
                  </div>
                );
              }
              if (day === 25) {
                return (
                  <div key={day} className="flex items-center justify-center py-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-200">
                      {day}
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={day}
                  className="py-1 text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Character Illustration & Health Shield */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative min-h-[240px]">
          {/* Floating cute health icons */}
          <div className="absolute top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-xs animate-bounce">
            <Heart className="h-4 w-4 fill-rose-500" />
          </div>
          <div className="absolute top-2 right-8 flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-[#3B4EF8] shadow-xs">
            <Clock className="h-4 w-4" />
          </div>
          <div className="absolute bottom-6 right-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[#3B4EF8] shadow-md border border-slate-100">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>

          {/* Friendly Doctor Vector Art */}
          <svg className="w-56 h-56" viewBox="0 0 200 200" fill="none">
            {/* Background circle aura */}
            <circle cx="100" cy="115" r="70" fill="#EEF2FC" />
            
            {/* Doctor Hair & Face */}
            <path d="M70 70 C60 90, 60 120, 65 140 C80 140, 80 100, 85 90" fill="#1E293B" />
            <path d="M130 70 C140 90, 140 120, 135 140 C120 140, 120 100, 115 90" fill="#1E293B" />
            
            {/* Head */}
            <circle cx="100" cy="80" r="24" fill="#FDE047" fillOpacity="0.4" />
            <circle cx="100" cy="80" r="22" fill="#FFE4E6" />
            
            {/* Glasses */}
            <circle cx="92" cy="78" r="6" stroke="#1E293B" strokeWidth="1.5" />
            <circle cx="108" cy="78" r="6" stroke="#1E293B" strokeWidth="1.5" />
            <line x1="98" y1="78" x2="102" y2="78" stroke="#1E293B" strokeWidth="1.5" />

            {/* Smile */}
            <path d="M96 88 Q100 92 104 88" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hair bangs */}
            <path d="M78 68 Q100 50 122 68 Q100 62 78 68" fill="#1E293B" />

            {/* Doctor Lab Coat (White) */}
            <path d="M75 102 L60 180 L140 180 L125 102 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M85 102 L100 135 L115 102" fill="#EEF2FF" stroke="#3B4EF8" strokeWidth="2" />
            
            {/* Stethoscope */}
            <path d="M88 102 C88 125, 112 125, 112 102" stroke="#3B4EF8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="128" r="4" fill="#F43F5E" />

            {/* Clipboard held in hands */}
            <rect x="85" y="125" width="30" height="42" rx="4" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
            <rect x="92" y="122" width="16" height="6" rx="2" fill="#3B4EF8" />
            <line x1="90" y1="138" x2="110" y2="138" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="90" y1="146" x2="110" y2="146" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="90" y1="154" x2="104" y2="154" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

            {/* Hands */}
            <circle cx="82" cy="145" r="5" fill="#FFE4E6" />
            <circle cx="118" cy="145" r="5" fill="#FFE4E6" />
          </svg>
        </div>
      </div>
    </div>
  );
};
