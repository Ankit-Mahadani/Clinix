export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  gender_display?: string;
  dob?: string;
  blood_group?: string;
  phone?: string;
  email?: string;
  address?: string;
  medical_history?: string;
  allergies?: string;
  emergency_contact?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_by_email?: string;
  assigned_doctors?: AssignedDoctor[];
  created_at: string;
  updated_at: string;
}

export interface AssignedDoctor {
  mapping_id: number;
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  license_number: string;
  hospital: string;
  phone: string;
  consultation_fee: string;
  is_primary: boolean;
  status: string;
  assigned_at: string;
  notes?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  license_number: string;
  years_of_experience: number;
  hospital: string;
  phone: string;
  email: string;
  consultation_fee: string | number;
  availability: string;
  is_active: boolean;
  created_by_email?: string;
  is_creator?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mapping {
  id: number;
  patient: number;
  patient_name: string;
  doctor: number;
  doctor_name: string;
  doctor_specialization: string;
  doctor_hospital: string;
  doctor_phone: string;
  consultation_fee: string | number;
  is_primary: boolean;
  status: string;
  notes?: string;
  assigned_at: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  kpis: {
    total_patients: number;
    total_doctors: number;
    active_mappings: number;
    unassigned_patients: number;
  };
  top_specializations: {
    specialization: string;
    count: number;
  }[];
  monthly_trend: {
    month: string;
    count: number;
  }[];
  gender_breakdown: {
    gender: string;
    count: number;
  }[];
}

export interface AuditLog {
  id: number;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
