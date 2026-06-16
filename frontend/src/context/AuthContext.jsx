import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('viva_token') || sessionStorage.getItem('viva_token'));
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Configure axios default auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user profile on mount if token exists
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API_URL}/auth/profile`);
        if (res.data.success) setUser(res.data.user);
      } catch {
        setToken(null);
        localStorage.removeItem('viva_token');
        sessionStorage.removeItem('viva_token');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [API_URL, token]);

  // ─── SEND REGISTRATION OTP ────────────────────────────────────────
  const sendRegistrationOTP = async (fullName, mobileNumber) => {
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { fullName, mobileNumber });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };

  // ─── REGISTER (Name, Mobile, Password, OTP) ───────────────────────
  const register = async (fullName, mobileNumber, password, otp) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { fullName, mobileNumber, password, otp });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  // ─── LOGIN (Mobile + Password, or Email for Admin) ───────────────
  const login = async (mobileOrEmail, password, rememberMe = true) => {
    try {
      const isEmail = mobileOrEmail.includes('@');
      const body = isEmail
        ? { email: mobileOrEmail, password }
        : { mobileNumber: mobileOrEmail, password };

      const res = await axios.post(`${API_URL}/auth/login`, body);
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        if (rememberMe) localStorage.setItem('viva_token', t);
        else sessionStorage.setItem('viva_token', t);
        setToken(t);
        setUser(u);
      }
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  // ─── ADMIN REGISTER (Name, Mobile, Password, Role, Secret Code) ───
  const adminRegister = async (fullName, mobileNumber, password, role, secretCode) => {
    try {
      const res = await axios.post(`${API_URL}/auth/admin-register`, {
        fullName,
        mobileNumber,
        password,
        role,
        secretCode
      });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Admin registration failed' };
    }
  };

  // ─── ADMIN LOGIN (Mobile + Password) ──────────────────────────────
  const adminLogin = async (mobileNumber, password, rememberMe = true) => {
    try {
      const res = await axios.post(`${API_URL}/auth/admin-login`, { mobileNumber, password });
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        if (rememberMe) localStorage.setItem('viva_token', t);
        else sessionStorage.setItem('viva_token', t);
        setToken(t);
        setUser(u);
      }
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Admin login failed' };
    }
  };

  // ─── SEND LOGIN OTP ───────────────────────────────────────────────
  const sendLoginOTP = async (mobileNumber) => {
    try {
      const res = await axios.post(`${API_URL}/auth/send-login-otp`, { mobileNumber });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };

  // ─── LOGIN WITH OTP ───────────────────────────────────────────────
  const loginWithOTP = async (mobileNumber, otp, rememberMe = true) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login-with-otp`, { mobileNumber, otp });
      if (res.data.success) {
        const { token: t, user: u } = res.data;
        axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
        if (rememberMe) localStorage.setItem('viva_token', t);
        else sessionStorage.setItem('viva_token', t);
        setToken(t);
        setUser(u);
      }
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Verification failed' };
    }
  };

  // ─── SEND FORGOT PASSWORD OTP ─────────────────────────────────────
  const sendForgotPasswordOTP = async (mobileNumber) => {
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { mobileNumber });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP' };
    }
  };

  // ─── VERIFY OTP + RESET PASSWORD ──────────────────────────────────
  const resetPasswordWithOTP = async (mobileNumber, otp, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/auth/verify-reset-otp`, { mobileNumber, otp, newPassword });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Reset failed' };
    }
  };

  // ─── LOGOUT ──────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('viva_token');
    sessionStorage.removeItem('viva_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // ─── UPDATE PROFILE ───────────────────────────────────────────────
  const updateProfile = async (data) => {
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, data);
      if (res.data.success) setUser(res.data.user);
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' };
    }
  };

  // ─── TOGGLE SAVED SERVICE ─────────────────────────────────────────
  const toggleSavedService = async (serviceId) => {
    try {
      const res = await axios.post(`${API_URL}/auth/toggle-save`, { serviceId });
      if (res.data.success) setUser(prev => ({ ...prev, savedServices: res.data.savedServices }));
      return { success: res.data.success };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, setUser, token, loading,
      API_URL,
      sendRegistrationOTP,
      register,
      login,
      adminRegister,
      adminLogin,
      sendLoginOTP,
      loginWithOTP,
      logout,
      sendForgotPasswordOTP,
      resetPasswordWithOTP,
      updateProfile,
      toggleSavedService
    }}>
      {children}
    </AuthContext.Provider>
  );
};
