import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Doctor } from '../types';
import {
  Search,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  Building,
  Award,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react';
import { DoctorFormModal } from '../components/DoctorFormModal';
import { Modal } from '../components/Modal';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);

  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (search.trim()) params.search = search.trim();
      if (selectedSpecialty) params.specialization = selectedSpecialty;

      const res = await api.doctors.list(params);
      if (res.success && res.data) {
        const docs = (res.data as any).results || res.data;
        setDoctors(Array.isArray(docs) ? docs : []);
      }
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSpecialty]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const specialties = Array.from(new Set(doctors.map((d) => d.specialization))).filter(Boolean);

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    setDeleteLoading(true);
    try {
      await api.doctors.delete(doctorToDelete.id);
      setDoctorToDelete(null);
      fetchDoctors();
    } catch (err) {
      console.error('Failed to delete doctor', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E2438]">
            Physician & Specialist Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse all authenticated hospital providers. Creator-only permissions for edits/deletions.
          </p>
        </div>

        <button
          onClick={() => {
            setDoctorToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#3B4EF8]/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register Medical Doctor</span>
        </button>
      </div>

      {/* Search, Filter, and View Mode Toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#F6F8FB] p-3.5 rounded-2xl border border-slate-100">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by physician name or hospital..."
            className="w-full rounded-full border border-slate-200/80 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 focus:border-[#3B4EF8] focus:outline-none"
          >
            <option value="">All Specialties</option>
            {specialties.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Grid vs Table Toggle */}
          <div className="flex items-center rounded-full bg-white border border-slate-200/80 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full p-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#3B4EF8] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-full p-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-[#3B4EF8] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Doctors Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                <span>Loading physician catalog...</span>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400">
              No doctors found matching query.
            </div>
          ) : (
            doctors.map((d) => (
              <div
                key={d.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        {d.specialization}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                        {d.name}
                      </h3>
                      <p className="text-xs text-slate-400">Lic. #{d.license_number}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {d.is_creator ? (
                        <>
                          <button
                            onClick={() => {
                              setDoctorToEdit(d);
                              setIsFormModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            title="Edit Doctor"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDoctorToDelete(d)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete Doctor"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <span
                          className="rounded-lg p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                          title="Read-only: created by another user"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{d.hospital}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{d.years_of_experience} years clinical practice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{d.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{d.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Consultation</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">
                    ${Number(d.consultation_fee).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Doctors Table View */
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 px-4">Physician</th>
                  <th className="py-3.5 px-4">Specialty</th>
                  <th className="py-3.5 px-4">Hospital</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Consultation Fee</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div>{d.name}</div>
                      <div className="text-xs text-slate-400">Lic. #{d.license_number}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-teal-50 px-2 py-0.5 text-xs font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        {d.specialization}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{d.hospital}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {d.years_of_experience} yrs
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-teal-700 dark:text-teal-300">
                      ${Number(d.consultation_fee).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {d.is_creator ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setDoctorToEdit(d);
                              setIsFormModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDoctorToDelete(d)}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                          <Lock className="h-3 w-3" /> Read-only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Register Doctor Modal */}
      <DoctorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        doctorToEdit={doctorToEdit}
        onSuccess={() => fetchDoctors()}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!doctorToDelete}
        onClose={() => setDoctorToDelete(null)}
        title="Delete Doctor from Catalog"
        description="Permanently remove this physician profile."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <strong>{doctorToDelete?.name}</strong>? Any active
            patient assignments to this doctor will be removed.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setDoctorToDelete(null)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
