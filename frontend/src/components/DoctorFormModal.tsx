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
      name: formData.name,
      specialization: formData.specialization,
      license_number: formData.license_number,
      years_of_experience: parseInt(formData.years_of_experience, 10),
      hospital: formData.hospital,
      phone: formData.phone,
      email: formData.email,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={doctorToEdit ? 'Edit Doctor Profile' : 'Register New Medical Doctor'}
      description="Doctors registered in the catalog can be assigned to patient clinical teams."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physician Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Sarah Jenkins"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Medical Specialty *
            </label>
            <input
              type="text"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Cardiology, Neurology"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              License Number (Unique) *
            </label>
            <input
              type="text"
              required
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="MD-89211-US"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Experience (Years) *
            </label>
            <input
              type="number"
              required
              min={0}
              max={70}
              value={formData.years_of_experience}
              onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
              placeholder="12"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Hospital / Clinic *
            </label>
            <input
              type="text"
              required
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              placeholder="Metropolitan General Hospital"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Consultation Fee ($) *
            </label>
            <input
              type="text"
              required
              value={formData.consultation_fee}
              onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
              placeholder="180.00"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0144"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="dr.jenkins@hospital.org"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Availability Schedule *
          </label>
          <input
            type="text"
            required
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            placeholder="Mon-Thu 08:30 - 16:30"
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
            {loading ? 'Saving...' : doctorToEdit ? 'Save Changes' : 'Register Doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
