import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { PatientFormModal } from './PatientFormModal';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsPatientModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGlobalSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/patients?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] p-3 sm:p-6 lg:p-8 flex items-center justify-center font-sans antialiased text-[#1E2438]">
      {/* Main Floating Rounded Canvas Container */}
      <div className="w-full max-w-[1440px] min-h-[850px] rounded-[36px] bg-white p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(20,30,65,0.08)] flex flex-col justify-between border border-white/80">
        {/* Top Navbar */}
        <Navbar
          onSearch={handleGlobalSearch}
          onRefresh={() => window.location.reload()}
        />

        {/* Body Split */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 pt-6 overflow-hidden">
          {/* Left Column Sidebar */}
          <Sidebar onNewPatient={() => setIsPatientModalOpen(true)} />

          {/* Center & Right Content View */}
          <main className="flex-1 overflow-y-auto pr-1">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Patient Creation Modal */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('patient-created'));
        }}
      />
    </div>
  );
};
