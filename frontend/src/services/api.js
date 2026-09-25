import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor to attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('earthscape_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('earthscape_token');
        localStorage.removeItem('earthscape_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Service API Groups
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const datasetService = {
  upload: (formData) => api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDatasets: () => api.get('/datasets'),
  getDatasetById: (id) => api.get(`/datasets/${id}`),
  deleteDataset: (id) => api.delete(`/datasets/${id}`),
};

export const climateService = {
  getRecords: (params) => api.get('/climate', { params }),
  getStatistics: (params) => api.get('/climate/statistics', { params }),
  getLocations: () => api.get('/climate/locations'),
  getExportUrl: (location) => `${API_BASE}/climate/export-csv${location ? `?location=${encodeURIComponent(location)}` : ''}`,
};

export const analyticsService = {
  runMapReduce: (data) => api.post('/analytics/process', data),
  getJobs: () => api.get('/analytics/jobs'),
  getJobById: (id) => api.get(`/analytics/jobs/${id}`),
  getHdfsStatus: () => api.get('/hdfs/status'),
  setHdfsMode: (mode) => api.post('/hdfs/mode', { mode }),
};

export const mlService = {
  predictTrends: (payload) => api.post('/ml/predict', payload),
  detectAnomalies: (payload) => api.post('/ml/detect-anomalies', payload),
  getAnomalies: (params) => api.get('/anomalies', { params }),
  updateAnomalyStatus: (id, data) => api.put(`/anomalies/${id}`, data),
  getCorrelations: () => api.get('/ml/correlations'),
};

export const alertService = {
  getAlerts: (params) => api.get('/alerts', { params }),
  updateAlert: (id, data) => api.put(`/alerts/${id}`, data),
  getSettings: () => api.get('/alerts/settings'),
  updateSettings: (data) => api.put('/alerts/settings', data),
};

export const simulationService = {
  start: (interval) => api.post('/simulation/start', { interval }),
  stop: () => api.post('/simulation/stop'),
  getStatus: () => api.get('/simulation/status'),
  getStreamUrl: () => `${API_BASE}/simulation/stream`,
};

export const supportService = {
  createTicket: (data) => api.post('/support', data),
  getTickets: (params) => api.get('/support', { params }),
  updateTicket: (id, data) => api.put(`/support/${id}`, data),
};

export const logService = {
  getLogs: (params) => api.get('/logs', { params }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const reportService = {
  getComprehensiveReport: (params) => api.get('/reports/comprehensive', { params }),
};

export default api;