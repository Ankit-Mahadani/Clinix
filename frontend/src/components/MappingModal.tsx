import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { Patient, Doctor, Mapping } from '../types';

interface MappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  doctors: Doctor[];
  preselectedPatientId?: number | null;
  onSuccess: (mapping: Mapping) => void;
}

export const MappingModal: React.FC<MappingModalProps> = ({
  isOpen,
  onClose,
  patients,
  doctors,
  preselectedPatientId,
  onSuccess,
}) => {
  const [patientId, setPatientId] = useState<number | string>(preselectedPatientId || (patients[0]?.id || ''));
  const [doctorId, setDoctorId] = useState<number | string>(doctors[0]?.id || '');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedPatientId) {
      setPatientId(preselectedPatientId);
    } else if (patients.length > 0 && !patientId) {
      setPatientId(patients[0].id);
    }
    if (doctors.length > 0 && !doctorId) {
      setDoctorId(doctors[0].id);
    }
  }, [preselectedPatientId, patients, doctors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !doctorId) {
      setError('Please select both a patient and a doctor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.mappings.create({
        patient: Number(patientId),
        doctor: Number(doctorId),
        is_primary: isPrimary,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error?.message || 'Failed to assign doctor.');
      }
    } catch (err: any) {
      const errResponse = err.response?.data;
      if (errResponse?.error?.message) {
        setError(errResponse.error.message);
      } else if (errResponse?.error?.details) {
        const details = errResponse.error.details;
        const firstKey = Object.keys(details)[0];
        setError(`${firstKey}: ${Array.isArray(details[firstKey]) ? details[firstKey][0] : details[firstKey]}`);
      } else {
        setError(err.message || 'Error occurred while creating assignment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Doctor to Patient"
      description="Link an attending specialist or primary physician to a patient care team."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Patient *
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Age: {p.age}, Blood: {p.blood_group || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Doctor *
          </label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(Number(e.target.value))}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization} ({d.hospital})
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 dark:border-teal-900/40 dark:bg-teal-950/20">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <div>
              <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                Designate as Primary Physician
              </span>
              <p className="text-[11px] text-teal-700/80 dark:text-teal-400 mt-0.5">
                Each patient can have only ONE primary physician. Marking this will replace any existing primary designation.
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Clinical Assignment Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Lead cardiologist supervising post-infarction rehab..."
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
