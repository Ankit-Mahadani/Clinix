import React, { useState } from 'react';
import { Search, Plus, Moon, Sun, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNewPatient?: () => void;
  onSearch?: (query: string) => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewPatient,
  onSearch,
  isDark,
  toggleDark,
}) => {
  const { user, logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search records, patients, doctors... (Press '/' to focus)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            /
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onNewPatient && (
          <button
            onClick={onNewPatient}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all active:scale-95"
            title="Press 'n' anywhere to add"
          >
            <Plus className="h-4 w-4" />
            <span>New Patient</span>
            <kbd className="hidden sm:inline-block ml-1 rounded bg-teal-700/60 px-1.5 py-0.2 text-[10px] font-normal text-teal-100">
              N
            </kbd>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleDark}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Swagger Doc link */}
        <a
          href="http://localhost:8000/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-teal-400 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>API Docs</span>
        </a>

        {/* User Dropdown / Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 font-semibold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
            {getInitials(user?.name)}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 dark:text-slate-100">
              {user?.name || 'Practitioner'}
              <ShieldCheck className="h-3 w-3 text-teal-500" />
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[130px]">{user?.email}</div>
          </div>

          <button
            onClick={logout}
            className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
