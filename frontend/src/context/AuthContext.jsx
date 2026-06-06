/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('viva_token') || sessionStorage.getItem('viva_token'));
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
        sessionStorage.removeItem('viva_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email, password, rememberMe = true) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        if (rememberMe) {
          localStorage.setItem('viva_token', res.data.token);
          sessionStorage.removeItem('viva_token');
        } else {
          sessionStorage.setItem('viva_token', res.data.token);
          localStorage.removeItem('viva_token');
        }
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

  const register = async (name, email, password, phone, rememberMe = true) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
      if (res.data.success) {
        if (rememberMe) {
          localStorage.setItem('viva_token', res.data.token);
          sessionStorage.removeItem('viva_token');
        } else {
          sessionStorage.setItem('viva_token', res.data.token);
          localStorage.removeItem('viva_token');
        }
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

  const loginWithGoogle = async (googleData, rememberMe = true) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google-login`, googleData);
      if (res.data.success) {
        if (rememberMe) {
          localStorage.setItem('viva_token', res.data.token);
          sessionStorage.removeItem('viva_token');
        } else {
          sessionStorage.setItem('viva_token', res.data.token);
          localStorage.removeItem('viva_token');
        }
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
    sessionStorage.removeItem('viva_token');
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

  const updateProfile = async (name, email, phone) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, { name, email, phone });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Failed to update profile.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: res.data.success, message: res.data.message, token: res.data.token };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send reset link.'
      };
    }
  };

  const resetPassword = async (tokenParam, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password/${tokenParam}`, { password });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to reset password.'
      };
    }
  };

  const validateResetToken = async (tokenParam) => {
    try {
      const res = await axios.get(`${API_URL}/auth/reset-password/${tokenParam}`);
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Reset token is invalid or expired.'
      };
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
      updateProfile,
      forgotPassword,
      resetPassword,
      validateResetToken,
      API_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};
