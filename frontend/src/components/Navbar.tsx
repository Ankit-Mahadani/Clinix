import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCw, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onRefresh }) => {
  const { logout } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 pb-6 pt-2 border-b border-slate-100">
      {/* Brand: Icon + "Mour" / "MediTrack" */}
      <div className="flex items-center gap-2.5 min-w-[200px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FC] text-[#3B4EF8] shadow-xs">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
        <span className="text-2xl font-extrabold tracking-tight text-[#1E2438]">
          Mour<span className="text-[#3B4EF8] font-normal text-xs ml-1 bg-[#EEF2FC] px-1.5 py-0.5 rounded-full">clinic</span>
        </span>
      </div>

      {/* Center Search Everything Pill */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <input
            id="global-search-input"
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search everything..."
            className="w-full rounded-full border border-slate-200/70 bg-[#F6F8FB] py-2.5 pl-5 pr-10 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#3B4EF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 transition-all shadow-2xs"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const input = document.getElementById('global-search-input');
            if (input) input.focus();
          }}
          className="rounded-full border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-50 hover:text-[#3B4EF8] transition-colors"
          title="Filter results"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <button
          onClick={onRefresh || (() => window.location.reload())}
          className="rounded-full border border-slate-200/80 p-2 text-slate-500 hover:bg-slate-50 hover:text-[#3B4EF8] transition-colors"
          title="Refresh telemetry"
        >
          <RotateCw className="h-4 w-4" />
        </button>

        <a
          href="http://localhost:8000/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#EEF2FC] px-3 py-1.5 text-[11px] font-bold text-[#3B4EF8] hover:bg-[#E0E7FF] transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>API Docs</span>
        </a>

        <button
          onClick={logout}
          className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
