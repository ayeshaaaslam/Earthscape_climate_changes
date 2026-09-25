import axios from 'axios';
import { mockApiHandler } from './mockData';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
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

// Resilient API Caller (Tries real API, seamlessly falls back to Standalone Mock Engine)
async function callResilient(apiFn, mockFn) {
  try {
    const res = await apiFn();
    return res;
  } catch (err) {
    // If backend is unreachable or returns network error, use standalone mock engine
    if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || err.response.status >= 500 || err.response.status === 404) {
      console.info('[EarthScape] Real backend unreachable. Using Standalone Live Engine.');
      return await mockFn();
    }
    throw err;
  }
}

// Service API Groups
export const authService = {
  login: (credentials) => callResilient(() => api.post('/auth/login', credentials), () => mockApiHandler.login(credentials)),
  register: (data) => callResilient(() => api.post('/auth/register', data), () => mockApiHandler.register(data)),
  getProfile: () => callResilient(() => api.get('/auth/profile'), () => mockApiHandler.getProfile()),
  forgotPassword: (data) => callResilient(() => api.post('/auth/forgot-password', data), () => Promise.resolve({ data: { success: true } })),
  resetPassword: (data) => callResilient(() => api.post('/auth/reset-password', data), () => Promise.resolve({ data: { success: true } })),
};

export const userService = {
  getUsers: (params) => callResilient(() => api.get('/users', { params }), () => mockApiHandler.getUsers(params)),
  createUser: (data) => callResilient(() => api.post('/users', data), () => mockApiHandler.createUser(data)),
  updateUser: (id, data) => callResilient(() => api.put(`/users/${id}`, data), () => mockApiHandler.updateUser(id, data)),
  deleteUser: (id) => callResilient(() => api.delete(`/users/${id}`), () => mockApiHandler.deleteUser(id)),
};

export const datasetService = {
  upload: (formData) => callResilient(() => api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }), () => mockApiHandler.uploadDataset(formData)),
  getDatasets: () => callResilient(() => api.get('/datasets'), () => mockApiHandler.getDatasets()),
  getDatasetById: (id) => callResilient(() => api.get(`/datasets/${id}`), () => mockApiHandler.getDatasets().then(r => ({ data: { success: true, dataset: r.data.datasets[0] } }))),
  deleteDataset: (id) => callResilient(() => api.delete(`/datasets/${id}`), () => mockApiHandler.deleteDataset(id)),
};

export const climateService = {
  getRecords: (params) => callResilient(() => api.get('/climate', { params }), () => mockApiHandler.getRecords(params)),
  getStatistics: (params) => callResilient(() => api.get('/climate/statistics', { params }), () => mockApiHandler.getStatistics(params)),
  getLocations: () => callResilient(() => api.get('/climate/locations'), () => mockApiHandler.getLocations()),
  getExportUrl: (location) => `${API_BASE}/climate/export-csv${location ? `?location=${encodeURIComponent(location)}` : ''}`,
};

export const analyticsService = {
  runMapReduce: (data) => callResilient(() => api.post('/analytics/process', data), () => mockApiHandler.runMapReduce(data)),
  getJobs: () => callResilient(() => api.get('/analytics/jobs'), () => mockApiHandler.getJobs()),
  getJobById: (id) => callResilient(() => api.get(`/analytics/jobs/${id}`), () => mockApiHandler.getJobs().then(r => ({ data: { success: true, job: r.data.jobs[0] } }))),
  getHdfsStatus: () => callResilient(() => api.get('/hdfs/status'), () => mockApiHandler.getHdfsStatus()),
  setHdfsMode: (mode) => callResilient(() => api.post('/hdfs/mode', { mode }), () => mockApiHandler.setHdfsMode({ mode })),
};

export const mlService = {
  predictTrends: (payload) => callResilient(() => api.post('/ml/predict', payload), () => mockApiHandler.predictTrends(payload)),
  detectAnomalies: (payload) => callResilient(() => api.post('/ml/detect-anomalies', payload), () => mockApiHandler.detectAnomalies(payload)),
  getAnomalies: (params) => callResilient(() => api.get('/anomalies', { params }), () => mockApiHandler.getAnomalies(params)),
  updateAnomalyStatus: (id, data) => callResilient(() => api.put(`/anomalies/${id}`, data), () => mockApiHandler.updateAnomalyStatus(id, data)),
  getCorrelations: () => callResilient(() => api.get('/ml/correlations'), () => mockApiHandler.getCorrelations()),
};

export const alertService = {
  getAlerts: (params) => callResilient(() => api.get('/alerts', { params }), () => mockApiHandler.getAlerts(params)),
  updateAlert: (id, data) => callResilient(() => api.put(`/alerts/${id}`, data), () => mockApiHandler.updateAlert(id, data)),
  getSettings: () => callResilient(() => api.get('/alerts/settings'), () => mockApiHandler.getSettings()),
  updateSettings: (data) => callResilient(() => api.put('/alerts/settings', data), () => mockApiHandler.updateSettings(data)),
};

export const simulationService = {
  start: (interval) => callResilient(() => api.post('/simulation/start', { interval }), () => mockApiHandler.startSimulation(interval)),
  stop: () => callResilient(() => api.post('/simulation/stop'), () => mockApiHandler.stopSimulation()),
  getStatus: () => callResilient(() => api.get('/simulation/status'), () => mockApiHandler.getSimulationStatus()),
  getStreamUrl: () => `${API_BASE}/simulation/stream`,
};

export const supportService = {
  createTicket: (data) => callResilient(() => api.post('/support', data), () => mockApiHandler.createTicket(data)),
  getTickets: (params) => callResilient(() => api.get('/support', { params }), () => mockApiHandler.getTickets(params)),
  updateTicket: (id, data) => callResilient(() => api.put(`/support/${id}`, data), () => mockApiHandler.updateTicket(id, data)),
};

export const logService = {
  getLogs: (params) => callResilient(() => api.get('/logs', { params }), () => mockApiHandler.getLogs(params)),
};

export const dashboardService = {
  getStats: () => callResilient(() => api.get('/dashboard/stats'), () => mockApiHandler.getDashboardStats()),
};

export const reportService = {
  getComprehensiveReport: (params) => callResilient(() => api.get('/reports/comprehensive', { params }), () => mockApiHandler.getComprehensiveReport(params)),
};

export default api;