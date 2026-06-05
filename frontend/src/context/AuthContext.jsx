/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('viva_token'));
  const [loading, setLoading] = useState(true);

  // Configure axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/profile`);
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Auth verification failed, clearing credentials.', err);
        localStorage.removeItem('viva_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('viva_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Invalid email or password.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.'
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
      if (res.data.success) {
        localStorage.setItem('viva_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const loginWithGoogle = async (googleData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google-login`, googleData);
      if (res.data.success) {
        localStorage.setItem('viva_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Google authentication failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google authentication failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('viva_token');
    setToken(null);
    setUser(null);
  };

  const toggleSaveService = async (serviceId) => {
    if (!user) {
      return { success: false, message: 'Please log in to bookmark services.' };
    }
    try {
      const res = await axios.post(`${API_URL}/auth/toggle-save`, { serviceId });
      if (res.data.success) {
        setUser(prev => ({
          ...prev,
          savedServices: res.data.savedServices
        }));
        return { success: true };
      }
    } catch (err) {
      console.error('Toggle save service failed:', err);
      return { success: false, message: 'Could not update bookmark.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      toggleSaveService,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};
