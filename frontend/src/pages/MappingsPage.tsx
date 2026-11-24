import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { Mapping, Patient, Doctor } from '../types';
import {
  Link2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../components/Modal';

export const MappingsPage: React.FC = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Wizard state
  const [selectedPatientId, setSelectedPatientId] = useState<number | string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | string>('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notes, setNotes] = useState('');
  const [wizardStep, setWizardStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [wizardSuccess, setWizardSuccess] = useState(false);

  // Delete state
  const [mappingToDelete, setMappingToDelete] = useState<Mapping | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mapsRes, ptsRes, docsRes] = await Promise.all([
        api.mappings.list(),
        api.patients.list(),
        api.doctors.list(),
      ]);

      if (mapsRes.success && mapsRes.data) {
        const list = (mapsRes.data as any).results || mapsRes.data;
        setMappings(Array.isArray(list) ? list : []);
      }

      if (ptsRes.success && ptsRes.data) {
        const pts = (ptsRes.data as any).results || ptsRes.data;
        setPatients(Array.isArray(pts) ? pts : []);
        if (pts.length > 0 && !selectedPatientId) {
          setSelectedPatientId(pts[0].id);
        }
      }

      if (docsRes.success && docsRes.data) {
        const docs = (docsRes.data as any).results || docsRes.data;
        setDoctors(Array.isArray(docs) ? docs : []);
        if (docs.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(docs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load assignments data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, selectedDoctorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      setWizardError('Please complete all wizard steps.');
      return;
    }

    setSubmitting(true);
    setWizardError(null);

    try {
      const res = await api.mappings.create({
        patient: Number(selectedPatientId),
        doctor: Number(selectedDoctorId),
        is_primary: isPrimary,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setWizardSuccess(true);
        setNotes('');
        setIsPrimary(false);
        setWizardStep(1);
        fetchData();
        setTimeout(() => setWizardSuccess(false), 4000);
      } else {
        setWizardError(res.error?.message || 'Assignment failed.');
      }
    } catch (err: any) {
      const errResponse = err.response?.data;
      if (errResponse?.error?.message) {
        setWizardError(errResponse.error.message);
      } else {
        setWizardError(err.message || 'Failed to link doctor and patient.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMapping = async () => {
    if (!mappingToDelete) return;
    setDeleteLoading(true);
    try {
      await api.mappings.delete(mappingToDelete.id);
      setMappingToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Failed to unassign doctor', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectedPatientObj = patients.find((p) => p.id === Number(selectedPatientId));
  const selectedDoctorObj = doctors.find((d) => d.id === Number(selectedDoctorId));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1E2438]">
          Care Team Assignments & Clinical Mappings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Coordinate multi-specialty attending teams for your patients. Primary physician rules enforced.
        </p>
      </div>

      {/* Assignment Wizard Card */}
      <div className="rounded-[28px] border border-slate-100 bg-[#F6F8FB] p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EEF2FC] text-[#3B4EF8]">
            <Link2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1E2438]">
              Assign Doctor Wizard
            </h2>
            <p className="text-[11px] text-slate-400">
              Link any specialist to your patient in 3 rapid steps
            </p>
          </div>
        </div>

        {/* Wizard Step Pills */}
        <div className="flex items-center gap-2 mb-6 max-w-md">
          {[
            { step: 1, title: '1. Select Patient' },
            { step: 2, title: '2. Select Doctor' },
            { step: 3, title: '3. Terms & Notes' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setWizardStep(s.step)}
              className={`flex-1 rounded-full py-2 text-xs font-bold transition-all cursor-pointer ${
                wizardStep === s.step
                  ? 'bg-[#3B4EF8] text-white shadow-md shadow-[#3B4EF8]/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {wizardSuccess && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Physician successfully assigned to patient care team!</span>
          </div>
        )}

        {wizardError && (
          <div className="mb-5 flex items-center gap-2.5 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800 border border-rose-200">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{wizardError}</span>
          </div>
        )}

        <form onSubmit={handleCreateAssignment}>
          {wizardStep === 1 && (
            <div className="space-y-4 max-w-xl">
              <label className="block text-xs font-bold text-[#1E2438]">
                Choose Patient from your records:
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 cursor-pointer shadow-2xs"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Age: {p.age}, Blood: {p.blood_group || 'N/A'})
                  </option>
                ))}
              </select>

              {selectedPatientObj && (
                <div className="rounded-2xl border border-[#DCE4FB] bg-[#F0F4FE] p-4 text-xs text-[#1E2438] space-y-1">
                  <div className="font-bold text-[#1E2438]">
                    Selected: {selectedPatientObj.name}
                  </div>
                  <div className="text-slate-600 font-medium">Contact: {selectedPatientObj.phone || 'No phone'}</div>
                  <div className="text-slate-600 font-medium">Allergies: {selectedPatientObj.allergies || 'None listed'}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#3B4EF8]/20 transition-all cursor-pointer"
              >
                Next: Choose Specialist →
              </button>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-4 max-w-xl">
              <label className="block text-xs font-bold text-[#1E2438]">
                Choose Specialist Doctor:
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10 cursor-pointer shadow-2xs"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization} ({d.hospital})
                  </option>
                ))}
              </select>

              {selectedDoctorObj && (
                <div className="rounded-2xl border border-[#DCE4FB] bg-[#F0F4FE] p-4 text-xs text-[#1E2438] space-y-1">
                  <div className="font-bold text-[#1E2438]">
                    {selectedDoctorObj.name} ({selectedDoctorObj.specialization})
                  </div>
                  <div className="text-slate-600 font-medium">Hospital: {selectedDoctorObj.hospital}</div>
                  <div className="text-slate-600 font-medium">Fee: ${Number(selectedDoctorObj.consultation_fee).toFixed(2)}</div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(1)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#3B4EF8]/20 transition-all cursor-pointer"
                >
                  Next: Terms & Notes →
                </button>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4 max-w-xl">
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
                      Only one primary doctor may lead the care team at any given time.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E2438] mb-1">
                  Clinical Care Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Lead physician overseeing cardiovascular monitoring and daily rounds..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs font-semibold text-[#1E2438] placeholder-slate-400 focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#3B4EF8] hover:bg-[#2A3BD9] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#3B4EF8]/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Confirming...' : 'Assign to Patient Care Team'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Existing Assignments Table */}
      <div className="rounded-[28px] border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1E2438]">
            Active Care Team Mappings ({mappings.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F8FB] border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-5">Patient</th>
                <th className="py-3.5 px-5">Assigned Doctor</th>
                <th className="py-3.5 px-5">Role / Priority</th>
                <th className="py-3.5 px-5">Notes</th>
                <th className="py-3.5 px-5">Assigned On</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B4EF8] border-t-transparent"></div>
                      <span>Loading care assignments...</span>
                    </div>
                  </td>
                </tr>
              ) : mappings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No doctor assignments recorded yet. Use the wizard above to link a doctor.
                  </td>
                </tr>
              ) : (
                mappings.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F9FAFC] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-[#1E2438]">
                      {m.patient_name}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#1E2438]">
                        {m.doctor_name}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {m.doctor_specialization} • {m.doctor_hospital}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {m.is_primary ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FC] px-3 py-1 text-[11px] font-bold text-[#3B4EF8]">
                          <UserCheck className="h-3 w-3" /> Primary Physician
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                          Attending Specialist
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-medium max-w-xs truncate">
                      {m.notes || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400">
                      {new Date(m.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setMappingToDelete(m)}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove Assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Mapping Modal */}
      <Modal
        isOpen={!!mappingToDelete}
        onClose={() => setMappingToDelete(null)}
        title="Remove Care Team Assignment"
        description="Unassign this physician from the patient."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove <strong>{mappingToDelete?.doctor_name}</strong> from{' '}
            <strong>{mappingToDelete?.patient_name}</strong>&apos;s care team?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setMappingToDelete(null)}
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-[#F6F8FB] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMapping}
              disabled={deleteLoading}
              className="rounded-full bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 shadow-md shadow-rose-600/20 transition-colors"
            >
              {deleteLoading ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
