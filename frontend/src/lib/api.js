import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Franchise API
export const franchiseAPI = {
  getAll: (activeOnly = true) => api.get('/franchises', { params: { active_only: activeOnly } }),
  getById: (id) => api.get(`/franchises/${id}`),
  create: (data) => api.post('/franchises', data),
  update: (id, data) => api.put(`/franchises/${id}`, data),
  delete: (id) => api.delete(`/franchises/${id}`),
};

// Property API
export const propertyAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
  deactivate: (id) => api.patch(`/properties/${id}/deactivate`),
  activate: (id) => api.patch(`/properties/${id}/activate`),
  uploadImage: (propertyId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/properties/${propertyId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Contact API
export const contactAPI = {
  send: (data) => api.post('/contact', data),
  getMessages: () => api.get('/contact/messages'),
  markAsRead: (id) => api.put(`/contact/messages/${id}/read`),
};

// Career API
export const careerAPI = {
  apply: (data) => api.post('/career/apply', data),
  getApplications: () => api.get('/career/applications'),
};

// Franchise Application API
export const franchiseApplicationAPI = {
  apply: (data) => api.post('/franchise/apply', data),
  getApplications: () => api.get('/franchise/applications'),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

// Location API - Türkiye 81 İl + İlçe + Mahalle
export const locationAPI = {
  getCities: () => api.get('/locations/cities'),
  getDistricts: (city) => api.get('/locations/districts', { params: { city } }),
  getNeighborhoods: (city, district) => api.get('/locations/neighborhoods', { params: { city, district } }),
  getStats: () => api.get('/locations/stats'),
  seedCities: () => api.post('/locations/seed-from-api'),
  seedNeighborhoods: (cityName) => api.post('/locations/seed-neighborhoods', null, { params: { city_name: cityName } }),
};

// Consultant API - Danışmanlar
export const consultantAPI = {
  getAll: (franchiseId = null, activeOnly = true) => 
    api.get('/consultants', { params: { franchise_id: franchiseId, active_only: activeOnly } }),
  getById: (id) => api.get(`/consultants/${id}`),
  getByFranchise: (franchiseId, activeOnly = true) => 
    api.get(`/franchises/${franchiseId}/consultants`, { params: { active_only: activeOnly } }),
  create: (data) => api.post('/consultants', data),
  update: (id, data) => api.put(`/consultants/${id}`, data),
  delete: (id) => api.delete(`/consultants/${id}`),
  uploadPhoto: (consultantId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/consultants/${consultantId}/upload-photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
