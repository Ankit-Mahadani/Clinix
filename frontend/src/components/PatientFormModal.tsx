import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { Patient } from '../types';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  onSuccess: (patient: Patient) => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'M',
    dob: '',
    blood_group: 'O+',
    phone: '',
    email: '',
    address: '',
    medical_history: '',
    allergies: '',
    emergency_contact: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        name: patientToEdit.name || '',
        age: patientToEdit.age?.toString() || '',
        gender: patientToEdit.gender || 'M',
        dob: patientToEdit.dob || '',
        blood_group: patientToEdit.blood_group || 'O+',
        phone: patientToEdit.phone || '',
        email: patientToEdit.email || '',
        address: patientToEdit.address || '',
        medical_history: patientToEdit.medical_history || '',
        allergies: patientToEdit.allergies || '',
        emergency_contact: patientToEdit.emergency_contact || '',
      });
    } else {
      setFormData({
        name: '',
        age: '',
        gender: 'M',
        dob: '',
        blood_group: 'O+',
        phone: '',
        email: '',
        address: '',
        medical_history: '',
        allergies: '',
        emergency_contact: '',
      });
    }
    setError(null);
  }, [patientToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: Partial<Patient> = {
        name: formData.name.trim(),
        age: Number(formData.age),
        gender: formData.gender as 'M' | 'F' | 'O',
        blood_group: formData.blood_group,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        dob: formData.dob || undefined,
        address: formData.address.trim() || undefined,
        medical_history: formData.medical_history.trim() || undefined,
        allergies: formData.allergies.trim() || undefined,
        emergency_contact: formData.emergency_contact.trim() || undefined,
      };

      const res = patientToEdit
        ? await api.patients.update(patientToEdit.id, payload)
        : await api.patients.create(payload);

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.error?.message || 'Operation failed');
      }
    } catch (err: any) {
      const errDetails = err.response?.data?.error;
      if (errDetails?.details) {
        const firstField = Object.keys(errDetails.details)[0];
        const msg = Array.isArray(errDetails.details[firstField])
          ? errDetails.details[firstField][0]
          : errDetails.details[firstField];
        setError(`${firstField}: ${msg}`);
      } else {
        setError(errDetails?.message || err.message || 'Failed to save patient');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={patientToEdit ? 'Edit Patient Record' : 'Register New Patient'}
      description="Enter official clinical details. All records are owner-isolated."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. John Doe"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Age (0-150) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={150}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="32"
                className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Blood Group
            </label>
            <select
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
            >
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="patient@domain.com"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Emergency Contact
          </label>
          <input
            type="text"
            value={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
            placeholder="e.g. Jane Doe (Spouse) +1 (555) 999-8888"
            className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Residential Address
          </label>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address, City, State, ZIP..."
            className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Known Allergies
            </label>
            <input
              type="text"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="e.g. Penicillin, Latex, Peanuts"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Medical History Notes
            </label>
            <input
              type="text"
              value={formData.medical_history}
              onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
              placeholder="e.g. Hypertension, Asthma"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>
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
            {loading ? 'Saving Record...' : patientToEdit ? 'Save Changes' : 'Register Patient'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
