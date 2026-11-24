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
          <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Select Patient *
          </label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Age: {p.age}, Blood: {p.blood_group || 'N/A'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Select Attending Doctor *
          </label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(Number(e.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialization} ({d.hospital})
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-[#DCE4FB] bg-[#F0F4FE] p-4">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#3B4EF8] focus:ring-[#3B4EF8]"
            />
            <div>
              <span className="text-xs font-bold text-[#1E2438]">
                Designate as Primary Attending Physician
              </span>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                A patient may only have one active primary physician at any given time.
              </p>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Clinical Assignment Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Lead cardiologist monitoring post-op recovery protocol..."
            className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-[#F6F8FB] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#3B4EF8]/20 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Assigning...' : 'Assign to Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
