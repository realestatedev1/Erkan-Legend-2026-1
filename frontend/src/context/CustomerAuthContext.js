import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { customerAuthAPI } from '../lib/api';

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    // First check localStorage
    const savedCustomer = localStorage.getItem('customer');
    const customerToken = localStorage.getItem('customerToken');
    
    if (savedCustomer && customerToken) {
      try {
        // Verify token is still valid
        const response = await customerAuthAPI.getMe();
        setCustomer(response.data);
        localStorage.setItem('customer', JSON.stringify(response.data));
      } catch (error) {
        console.log('Token expired, clearing auth');
        localStorage.removeItem('customer');
        localStorage.removeItem('customerToken');
        setCustomer(null);
      }
    }
    setLoading(false);
  };

  const loginWithEmail = async (email, password) => {
    const response = await customerAuthAPI.login({ email, password });
    const { token, customer: customerData } = response.data;
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customer', JSON.stringify(customerData));
    setCustomer(customerData);
    return customerData;
  };

  const registerWithEmail = async (data) => {
    const response = await customerAuthAPI.register(data);
    const { token, customer: customerData } = response.data;
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customer', JSON.stringify(customerData));
    setCustomer(customerData);
    return customerData;
  };

  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const processOAuthCallback = async (sessionId) => {
    try {
      const response = await customerAuthAPI.processOAuthSession(sessionId);
      const { token, customer: customerData } = response.data;
      localStorage.setItem('customerToken', token);
      localStorage.setItem('customer', JSON.stringify(customerData));
      setCustomer(customerData);
      return customerData;
    } catch (error) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await customerAuthAPI.logout();
    } catch (error) {
      console.log('Logout API error (continuing anyway):', error);
    }
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    setCustomer(null);
  };

  const updateCustomer = (data) => {
    const updated = { ...customer, ...data };
    setCustomer(updated);
    localStorage.setItem('customer', JSON.stringify(updated));
  };

  return (
    <CustomerAuthContext.Provider value={{
      customer,
      loading,
      isAuthenticated: !!customer,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      processOAuthCallback,
      logout,
      updateCustomer,
      checkAuth
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};
