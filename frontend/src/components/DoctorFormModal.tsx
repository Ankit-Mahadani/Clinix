import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { api } from '../api/client';
import type { Doctor } from '../types';

interface DoctorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorToEdit?: Doctor | null;
  onSuccess: (doctor: Doctor) => void;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  onClose,
  doctorToEdit,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Cardiology',
    license_number: '',
    years_of_experience: '5',
    hospital: '',
    phone: '',
    email: '',
    consultation_fee: '150.00',
    availability: 'Mon-Fri 09:00 - 17:00',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (doctorToEdit) {
      setFormData({
        name: doctorToEdit.name || '',
        specialization: doctorToEdit.specialization || 'Cardiology',
        license_number: doctorToEdit.license_number || '',
        years_of_experience: doctorToEdit.years_of_experience?.toString() || '5',
        hospital: doctorToEdit.hospital || '',
        phone: doctorToEdit.phone || '',
        email: doctorToEdit.email || '',
        consultation_fee: doctorToEdit.consultation_fee?.toString() || '150.00',
        availability: doctorToEdit.availability || 'Mon-Fri 09:00 - 17:00',
      });
    } else {
      setFormData({
        name: '',
        specialization: 'Cardiology',
        license_number: '',
        years_of_experience: '5',
        hospital: '',
        phone: '',
        email: '',
        consultation_fee: '150.00',
        availability: 'Mon-Fri 09:00 - 17:00',
      });
    }
    setError(null);
  }, [doctorToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Partial<Doctor> = {
      name: formData.name.trim(),
      specialization: formData.specialization,
      license_number: formData.license_number.trim(),
      years_of_experience: parseInt(formData.years_of_experience, 10),
      hospital: formData.hospital.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      consultation_fee: formData.consultation_fee,
      availability: formData.availability,
    };

    try {
      let res;
      if (doctorToEdit) {
        res = await api.doctors.patch(doctorToEdit.id, payload);
      } else {
        res = await api.doctors.create(payload);
      }

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
        setError(errDetails?.message || err.message || 'Failed to save doctor');
      }
    } finally {
      setLoading(false);
    }
  };

  const specialtiesList = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'General Medicine',
    'Neurology',
    'Oncology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'Pulmonology',
    'Radiology',
    'Surgery',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doctorToEdit ? 'Edit Physician Profile' : 'Register Medical Specialist'}
      description="Register an accredited provider into the clinical directory."
      maxWidth="xl"
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
              Physician Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Maya Lin Tanaka"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none focus:ring-2 focus:ring-[#3B4EF8]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Medical Specialty *
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
            >
              {specialtiesList.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              State License Number *
            </label>
            <input
              type="text"
              required
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="e.g. MED-884920"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Years of Practice *
            </label>
            <input
              type="number"
              required
              min={0}
              max={70}
              value={formData.years_of_experience}
              onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Primary Hospital / Clinic *
            </label>
            <input
              type="text"
              required
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              placeholder="e.g. Johns Hopkins Medical"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Consultation Fee ($ USD) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              min={0}
              value={formData.consultation_fee}
              onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
              placeholder="150.00"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Office Phone *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 019-2834"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Direct Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="doctor@hospital.org"
              className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">
            Weekly Availability Schedule
          </label>
          <input
            type="text"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            placeholder="Mon-Fri 09:00 - 17:00"
            className="w-full rounded-2xl border border-slate-200 bg-[#F6F8FB] focus:bg-white px-3.5 py-2.5 text-xs font-semibold text-[#1E2438] focus:border-[#3B4EF8] focus:outline-none"
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
            {loading ? 'Saving Profile...' : doctorToEdit ? 'Save Changes' : 'Register Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
