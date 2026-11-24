import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Folder,
  Calendar,
  Compass,
  Link2,
  History,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  onNewPatient?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewPatient }) => {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'My Account', icon: Folder },
    { to: '/patients', label: 'Calendar / Patients', icon: Calendar },
    { to: '/doctors', label: 'Discover / Doctors', icon: Compass },
    { to: '/mappings', label: 'Assignments', icon: Link2 },
    { to: '/audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside className="w-56 shrink-0 flex flex-col justify-between py-2 pr-4 space-y-6">
      <div className="space-y-6">
        {/* "Create New Post" / "Create New Patient" Capsule Button */}
        {onNewPatient && (
          <button
            onClick={onNewPatient}
            className="w-full flex items-center justify-between pl-4 pr-1.5 py-1.5 rounded-full bg-[#EEF2FC] hover:bg-[#E2EAFA] text-[#3B4EF8] text-xs font-bold transition-all shadow-xs group"
          >
            <span>Create New Patient</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3B4EF8] text-white shadow-xs group-hover:scale-105 transition-transform">
              <Plus className="h-4 w-4" />
            </div>
          </button>
        )}

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#EEF2FC] text-[#3B4EF8] font-bold shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/80'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 opacity-75" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Lower Promo Card & User Footer */}
      <div className="space-y-5 pt-4">
        {/* Floating Blue Promo Card */}
        <div className="rounded-3xl bg-[#3B4EF8] p-4 text-white shadow-lg shadow-[#3B4EF8]/25 relative overflow-hidden">
          <div className="relative z-10 space-y-2.5">
            <p className="text-[11px] font-semibold text-white/90 leading-tight">
              Try the new updated <br />
              <span className="font-bold text-white text-xs">Version 1.2.0</span>
            </p>
            <a
              href="http://localhost:8000/api/docs/"
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-[#3B4EF8] shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-center"
            >
              View
            </a>
          </div>
        </div>

        {/* User Avatar Footer */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-rose-400 via-purple-400 to-indigo-500 text-white font-bold text-xs shadow-sm">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DR'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#1E2438] truncate">
              {user?.name || 'Dr. Ann Curgy'}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">Hirurgy Specialist</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
