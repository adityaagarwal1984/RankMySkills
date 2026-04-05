import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'rankmyskills_admin_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifySession();
  }, []);

  const persistUser = (nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const verifySession = async () => {
    try {
      await api.get('/admin/stats');
    } catch (error) {
      persistUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });

    if (response.data?.user?.role !== 'super_admin') {
      await api.post('/auth/logout').catch(() => {});
      throw new Error('Only super admin accounts can access this portal.');
    }

    persistUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      persistUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
