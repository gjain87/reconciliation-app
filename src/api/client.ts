import axios from 'axios'
import type { AuthResponse, Discrepancy, ExplainResponse, ReconciliationSummary } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
};

export const reconciliationApi = {
  uploadFiles: (formData: FormData) =>
    api.post('/reconciliation/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getSummary: () => api.get<ReconciliationSummary>('/dashboard/discrepancies'),
  getDiscrepancies: (params?: { type?: string; severity?: string; search?: string }) =>
    api.get<Discrepancy[]>('/dashboard/discrepancies', { params }),
  explainDiscrepancy: (discrepancyId: string) =>
    api.post<ExplainResponse>(`/reconciliation/discrepancies/${discrepancyId}/explain`),
  explainAll: () =>
    api.post<{ executiveSummary: string; topRisks: string[] }>('/reconciliation/explain-summary'),
};

export default api;