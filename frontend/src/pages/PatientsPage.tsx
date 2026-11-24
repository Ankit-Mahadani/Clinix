import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Patient, Doctor, Mapping } from '../types';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { PatientFormModal } from '../components/PatientFormModal';
import { MappingModal } from '../components/MappingModal';
import { Modal } from '../components/Modal';

export const PatientsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [genderFilter, setGenderFilter] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Doctors for assignment
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [selectedPatientForMapping, setSelectedPatientForMapping] = useState<Patient | null>(null);

  const [selectedPatientDetail, setSelectedPatientDetail] = useState<Patient | null>(null);
  const [patientAssignedDoctors, setPatientAssignedDoctors] = useState<any[]>([]);

  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [deleteSoft, setDeleteSoft] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (search.trim()) params.search = search.trim();
      if (genderFilter) params.gender = genderFilter;
      if (bloodGroupFilter) params.blood_group = bloodGroupFilter;

      const res = await api.patients.list(params);
      if (res.success && res.data) {
        if ('results' in res.data) {
          setPatients(res.data.results);
          setTotalCount(res.data.count);
        } else if (Array.isArray(res.data)) {
          setPatients(res.data);
          setTotalCount(res.data.length);
        }
      }
    } catch (err) {
      console.error('Error fetching patients', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, genderFilter, bloodGroupFilter]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    const handlePatientCreated = () => fetchPatients();
    window.addEventListener('patient-created', handlePatientCreated);
    return () => window.removeEventListener('patient-created', handlePatientCreated);
  }, [fetchPatients]);

  // Load doctors for mapping modal
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await api.doctors.list();
        if (res.success && res.data) {
          const docs = (res.data as any).results || res.data;
          setDoctors(Array.isArray(docs) ? docs : []);
        }
      } catch (err) {
        console.error('Failed to load doctors list', err);
      }
    };
    loadDoctors();
  }, []);

  const handleOpenDetail = async (p: Patient) => {
    setSelectedPatientDetail(p);
    try {
      const res = await api.mappings.getByPatient(p.id);
      if (res.success && res.data) {
        setPatientAssignedDoctors(res.data.assigned_doctors || res.data || []);
      }
    } catch {
      setPatientAssignedDoctors([]);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    setDeleteLoading(true);
    try {
      await api.patients.delete(patientToDelete.id, deleteSoft);
      setPatientToDelete(null);
      fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUnassignDoctor = async (mappingId: number) => {
    try {
      await api.mappings.delete(mappingId);
      if (selectedPatientDetail) {
        handleOpenDetail(selectedPatientDetail);
      }
      fetchPatients();
    } catch (err) {
      console.error('Failed to unassign doctor', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Patients Clinical Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Owner-isolated records. Only patients created by your account are accessible.
          </p>
        </div>

        <button
          onClick={() => {
            setPatientToEdit(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search patient by name, phone, or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Genders</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>

          <div className="flex-1 md:flex-initial">
            <select
              value={bloodGroupFilter}
              onChange={(e) => {
                setBloodGroupFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Blood Groups</option>
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
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Demographics</th>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Assigned Doctors</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No patients found. Click &quot;Register New Patient&quot; to add one.
                  </td>
                </tr>
              ) : (
                patients.map((p) => {
                  const doctorsCount = p.assigned_doctors?.length || 0;
                  const primaryDoc = p.assigned_doctors?.find((d) => d.is_primary);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => handleOpenDetail(p)}
                              className="font-semibold text-slate-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400 text-left cursor-pointer"
                            >
                              {p.name}
                            </button>
                            <div className="text-xs text-slate-400">ID #{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.age} yrs • {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.blood_group || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div>{p.phone || 'No phone'}</div>
                        <div className="text-slate-400">{p.email || 'No email'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {doctorsCount > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              {doctorsCount} assigned
                            </span>
                            {primaryDoc && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                Primary: {primaryDoc.doctor_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(p)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="View Full Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatientForMapping(p);
                              setIsMappingModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40"
                            title="Assign Specialist"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPatientToEdit(p);
                              setIsFormModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            title="Edit Record"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setPatientToDelete(p);
                              setDeleteSoft(false);
                            }}
                            className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold">{patients.length}</span> of{' '}
            <span className="font-semibold">{totalCount}</span> total records
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Page {page}</span>
            <button
              disabled={patients.length < 10}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Edit / Register Modal */}
      <PatientFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        patientToEdit={patientToEdit}
        onSuccess={() => fetchPatients()}
      />

      {/* Assign Doctor Modal */}
      <MappingModal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        patients={patients}
        doctors={doctors}
        preselectedPatientId={selectedPatientForMapping?.id}
        onSuccess={(_mapping: Mapping) => fetchPatients()}
      />

      {/* Patient Detail Slide-Over Modal */}
      <Modal
        isOpen={!!selectedPatientDetail}
        onClose={() => setSelectedPatientDetail(null)}
        title={selectedPatientDetail?.name || 'Patient Profile'}
        description={`Record ID #${selectedPatientDetail?.id} • Registered ${selectedPatientDetail?.created_at ? new Date(selectedPatientDetail.created_at).toLocaleDateString() : ''}`}
        maxWidth="2xl"
      >
        {selectedPatientDetail && (
          <div className="space-y-6 text-sm">
            {/* Quick stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl dark:bg-slate-800/60">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Age & Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedPatientDetail.age} yrs ({selectedPatientDetail.gender})
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Blood Group</span>
                <span className="font-bold text-teal-600 dark:text-teal-400">
                  {selectedPatientDetail.blood_group || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedPatientDetail.phone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">DOB</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedPatientDetail.dob || 'N/A'}
                </span>
              </div>
            </div>

            {/* Medical notes */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Medical History & Allergies
              </h4>
              <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Allergies: </span>
                  <span className="text-xs text-rose-600 font-semibold dark:text-rose-400">
                    {selectedPatientDetail.allergies || 'No known allergies'}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500">History: </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {selectedPatientDetail.medical_history || 'No prior medical conditions documented.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Doctors Team */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Clinical Team ({patientAssignedDoctors.length})
                </h4>
                <button
                  onClick={() => {
                    setSelectedPatientForMapping(selectedPatientDetail);
                    setIsMappingModalOpen(true);
                  }}
                  className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Assign Doctor
                </button>
              </div>

              {patientAssignedDoctors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800">
                  No doctors currently assigned to this patient.
                </div>
              ) : (
                <div className="space-y-2">
                  {patientAssignedDoctors.map((doc) => (
                    <div
                      key={doc.mapping_id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {doc.doctor_name}
                          </span>
                          {doc.is_primary && (
                            <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                              Primary Physician
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {doc.specialization} • {doc.hospital}
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnassignDoctor(doc.mapping_id)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Remove Assignment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        title="Confirm Record Deletion"
        description="Permanently delete or archive this patient record."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-200 border border-amber-200 dark:border-amber-900">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              Are you sure you want to delete patient <strong>{patientToDelete?.name}</strong>?
              This action cannot be undone unless soft-deleted.
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={deleteSoft}
              onChange={(e) => setDeleteSoft(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Soft Delete (retain in database for audit and compliance trail)</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setPatientToDelete(null)}
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
