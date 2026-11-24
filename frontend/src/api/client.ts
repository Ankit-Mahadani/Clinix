import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Patient,
  Doctor,
  Mapping,
  DashboardStats,
  AuditLog,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints
      if (originalRequest.url?.includes('/auth/login/') || originalRequest.url?.includes('/auth/register/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = data.data?.access || data.access;
        const newRefreshToken = data.data?.refresh || data.refresh || refreshToken;

        localStorage.setItem('access_token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Typed API Functions
export const api = {
  // Auth
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const res = await apiClient.post<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>>('/auth/login/', credentials);
      return res.data;
    },
    register: async (userData: { name: string; email: string; password: string; password2: string }) => {
      const res = await apiClient.post<ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>>('/auth/register/', userData);
      return res.data;
    },
    logout: async () => {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          await apiClient.post('/auth/logout/', { refresh });
        } catch {
          // ignore error on logout
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    },
    me: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me/');
      return res.data;
    },
    updateMe: async (userData: Partial<User>) => {
      const res = await apiClient.patch<ApiResponse<User>>('/auth/me/', userData);
      return res.data;
    },
  },

  // Patients
  patients: {
    list: async (params?: Record<string, any>) => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<Patient>> | ApiResponse<Patient[]>>('/patients/', { params });
      return res.data;
    },
    get: async (id: number) => {
      const res = await apiClient.get<ApiResponse<Patient>>(`/patients/${id}/`);
      return res.data;
    },
    create: async (patient: Partial<Patient>) => {
      const res = await apiClient.post<ApiResponse<Patient>>('/patients/', patient);
      return res.data;
    },
    update: async (id: number, patient: Partial<Patient>) => {
      const res = await apiClient.put<ApiResponse<Patient>>(`/patients/${id}/`, patient);
      return res.data;
    },
    patch: async (id: number, patient: Partial<Patient>) => {
      const res = await apiClient.patch<ApiResponse<Patient>>(`/patients/${id}/`, patient);
      return res.data;
    },
    delete: async (id: number, soft: boolean = false) => {
      const res = await apiClient.delete<ApiResponse<any>>(`/patients/${id}/`, {
        params: soft ? { soft: 'true' } : undefined,
      });
      return res.data;
    },
  },

  // Doctors
  doctors: {
    list: async (params?: Record<string, any>) => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<Doctor>> | ApiResponse<Doctor[]>>('/doctors/', { params });
      return res.data;
    },
    get: async (id: number) => {
      const res = await apiClient.get<ApiResponse<Doctor>>(`/doctors/${id}/`);
      return res.data;
    },
    create: async (doctor: Partial<Doctor>) => {
      const res = await apiClient.post<ApiResponse<Doctor>>('/doctors/', doctor);
      return res.data;
    },
    update: async (id: number, doctor: Partial<Doctor>) => {
      const res = await apiClient.put<ApiResponse<Doctor>>(`/doctors/${id}/`, doctor);
      return res.data;
    },
    patch: async (id: number, doctor: Partial<Doctor>) => {
      const res = await apiClient.patch<ApiResponse<Doctor>>(`/doctors/${id}/`, doctor);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await apiClient.delete<ApiResponse<any>>(`/doctors/${id}/`);
      return res.data;
    },
  },

  // Mappings
  mappings: {
    list: async (params?: Record<string, any>) => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<Mapping>> | ApiResponse<Mapping[]>>('/mappings/', { params });
      return res.data;
    },
    getByPatient: async (patientId: number) => {
      const res = await apiClient.get<ApiResponse<any>>(`/mappings/${patientId}/`);
      return res.data;
    },
    create: async (data: { patient: number; doctor: number; notes?: string; is_primary?: boolean }) => {
      const res = await apiClient.post<ApiResponse<Mapping>>('/mappings/', data);
      return res.data;
    },
    delete: async (id: number) => {
      const res = await apiClient.delete<ApiResponse<any>>(`/mappings/${id}/`);
      return res.data;
    },
  },

  // Dashboard
  dashboard: {
    stats: async () => {
      const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats/');
      return res.data;
    },
  },

  // Audit Logs
  audit: {
    list: async (params?: Record<string, any>) => {
      const res = await apiClient.get<ApiResponse<PaginatedResponse<AuditLog>> | ApiResponse<AuditLog[]>>('/audit/', { params });
      return res.data;
    },
  },
};
