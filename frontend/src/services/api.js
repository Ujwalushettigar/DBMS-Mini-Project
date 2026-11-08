import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grems_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Unified Error handling & response data unwrapping
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Server connection error';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (candidateData) => api.post('/auth/register', candidateData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
};

export const candidateAPI = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  getMyProfile: () => api.get('/candidates/me'),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`)
};

export const qualificationAPI = {
  getQualifications: (candidateId) => api.get('/qualifications', { params: { candidate_id: candidateId } }),
  add: (data) => api.post('/qualifications', data),
  update: (id, data) => api.put(`/qualifications/${id}`, data),
  delete: (id) => api.delete(`/qualifications/${id}`)
};

export const examAPI = {
  getAll: (params) => api.get('/examinations', { params }),
  getById: (id) => api.get(`/examinations/${id}`),
  create: (data) => api.post('/examinations', data),
  update: (id, data) => api.put(`/examinations/${id}`, data),
  delete: (id) => api.delete(`/examinations/${id}`)
};

export const centerAPI = {
  getAll: () => api.get('/centers'),
  getById: (id) => api.get(`/centers/${id}`),
  create: (data) => api.post('/centers', data),
  update: (id, data) => api.put(`/centers/${id}`, data),
  delete: (id) => api.delete(`/centers/${id}`),
  assignToExam: (data) => api.post('/centers/assign', data)
};

export const applicationAPI = {
  getAll: (params) => api.get('/applications', { params }),
  getMyApplications: () => api.get('/applications/my-applications'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data)
};

export const admitCardAPI = {
  getAll: () => api.get('/admit-cards'),
  getMyCards: () => api.get('/admit-cards/my-cards'),
  getById: (id) => api.get(`/admit-cards/${id}`),
  generate: (data) => api.post('/admit-cards/generate', data)
};

export const resultAPI = {
  getAll: (params) => api.get('/results', { params }),
  getMyResults: () => api.get('/results/my-results'),
  getById: (id) => api.get(`/results/${id}`),
  save: (data) => api.post('/results', data),
  publish: (id) => api.put(`/results/${id}/publish`)
};

export const dashboardAPI = {
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getCandidateDashboard: () => api.get('/dashboard/candidate')
};

export default api;

