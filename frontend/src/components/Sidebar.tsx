import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Link2,
  History,
  FileCode2,
  HeartPulse,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/patients', label: 'Patients', icon: Users },
    { to: '/doctors', label: 'Doctor Catalog', icon: UserCheck },
    { to: '/mappings', label: 'Assignments', icon: Link2 },
    { to: '/audit', label: 'Audit Trail', icon: History },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors shrink-0">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Medi<span className="text-teal-600 dark:text-teal-400">Track</span>
          </span>
          <span className="ml-1.5 rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            PRO
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Clinical Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-xs dark:bg-teal-950/50 dark:text-teal-300 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Developer & System
        </div>

        <a
          href="http://localhost:8000/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-colors"
        >
          <FileCode2 className="h-4 w-4 shrink-0 text-amber-500" />
          <span>OpenAPI / Swagger</span>
        </a>

        <a
          href="http://localhost:8000/api/health/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 transition-colors"
        >
          <Activity className="h-4 w-4 shrink-0 text-emerald-500" />
          <span>System Health Check</span>
        </a>
      </div>

      {/* System Status Footer */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              API Connected
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
};
