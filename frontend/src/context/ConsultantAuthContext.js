import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../lib/api';

const ConsultantAuthContext = createContext();

export const useConsultantAuth = () => {
  const context = useContext(ConsultantAuthContext);
  if (!context) {
    throw new Error('useConsultantAuth must be used within ConsultantAuthProvider');
  }
  return context;
};

// API functions for consultant
const consultantPortalAPI = {
  login: (data) => api.post('/consultant/login', data),
  getMe: () => api.get('/consultant/me'),
  updateProfile: (data) => api.put('/consultant/me', data),
  getProperties: (skip = 0, limit = 50) => api.get('/consultant/properties', { params: { skip, limit } }),
  createProperty: (data) => api.post('/consultant/properties', data),
  updateProperty: (id, data) => api.put(`/consultant/properties/${id}`, data),
  deleteProperty: (id) => api.delete(`/consultant/properties/${id}`),
  uploadPropertyImage: (propertyId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/consultant/properties/${propertyId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export { consultantPortalAPI };

export const ConsultantAuthProvider = ({ children }) => {
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('consultantToken');
    const savedConsultant = localStorage.getItem('consultantData');
    
    if (token && savedConsultant) {
      try {
        // Set token in axios defaults
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token is still valid
        const response = await consultantPortalAPI.getMe();
        setConsultant(response.data);
        localStorage.setItem('consultantData', JSON.stringify(response.data));
      } catch (error) {
        console.log('Consultant token expired, clearing auth');
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    const response = await consultantPortalAPI.login({ username, password });
    const { access_token, consultant: consultantData } = response.data;
    
    localStorage.setItem('consultantToken', access_token);
    localStorage.setItem('consultantData', JSON.stringify(consultantData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    
    setConsultant(consultantData);
    return consultantData;
  };

  const logout = () => {
    localStorage.removeItem('consultantToken');
    localStorage.removeItem('consultantData');
    delete api.defaults.headers.common['Authorization'];
    setConsultant(null);
  };

  const updateConsultant = (data) => {
    const updated = { ...consultant, ...data };
    setConsultant(updated);
    localStorage.setItem('consultantData', JSON.stringify(updated));
  };

  return (
    <ConsultantAuthContext.Provider value={{
      consultant,
      loading,
      isAuthenticated: !!consultant,
      login,
      logout,
      updateConsultant,
      checkAuth
    }}>
      {children}
    </ConsultantAuthContext.Provider>
  );
};
