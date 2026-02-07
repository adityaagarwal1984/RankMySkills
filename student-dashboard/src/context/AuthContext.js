import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by trying to fetch profile
    // The api interceptor will handle token refresh if needed
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/student/profile');
      setUser(response.data.student);
    } catch (error) {
      // Not logged in or session expired
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    // Token is now in HttpOnly cookie
    await fetchProfile();
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register/student', userData);
    // Token is now in HttpOnly cookie
    await fetchProfile();
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const response = await api.put('/student/profile', updates);
    setUser(response.data.student);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
