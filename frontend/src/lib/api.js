import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for OAuth
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Also check customer token
  const customerToken = localStorage.getItem('customerToken');
  if (customerToken && !token) {
    config.headers.Authorization = `Bearer ${customerToken}`;
  }
  return config;
});

// Auth API (Admin)
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Customer Auth API
export const customerAuthAPI = {
  register: (data) => api.post('/customer/register', data),
  login: (data) => api.post('/customer/login', data),
  processOAuthSession: (sessionId) => api.get('/customer/auth/session', { params: { session_id: sessionId } }),
  getMe: () => api.get('/customer/auth/me'),
  logout: () => api.post('/customer/auth/logout'),
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (data) => api.put('/customer/profile', data),
};

// Customer Features API
export const customerAPI = {
  // Favorites
  getFavorites: () => api.get('/customer/favorites'),
  addFavorite: (propertyId) => api.post(`/customer/favorites/${propertyId}`),
  removeFavorite: (propertyId) => api.delete(`/customer/favorites/${propertyId}`),
  
  // Notifications
  getNotifications: (unreadOnly = false, limit = 20) => 
    api.get('/customer/notifications', { params: { unread_only: unreadOnly, limit } }),
  markNotificationRead: (id) => api.put(`/customer/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/customer/notifications/read-all'),
  
  // Saved Searches
  getSavedSearches: () => api.get('/customer/saved-searches'),
  saveSearch: (name, criteria, emailAlert = false) => 
    api.post('/customer/saved-searches', null, { params: { name, criteria, email_alert: emailAlert } }),
  deleteSavedSearch: (id) => api.delete(`/customer/saved-searches/${id}`),
  
  // Price Alerts
  getPriceAlerts: () => api.get('/customer/price-alerts'),
  createPriceAlert: (propertyId, targetPrice) => 
    api.post('/customer/price-alerts', null, { params: { property_id: propertyId, target_price: targetPrice } }),
  deletePriceAlert: (id) => api.delete(`/customer/price-alerts/${id}`),
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

export default api;
