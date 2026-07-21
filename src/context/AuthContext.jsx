import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load persisted session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ganga_guardian_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user session', e);
        localStorage.removeItem('ganga_guardian_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user: userData } = response;
      const loggedUser = {
        ...userData,
        token,
      };

      setUser(loggedUser);
      localStorage.setItem('ganga_guardian_user', JSON.stringify(loggedUser));
      setLoading(false);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      const errorMsg = err.message || 'Invalid email or password.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signUp = async (email, password, name) => {
    setAuthError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        name: name || 'Registered Citizen',
      });

      const { token, user: userData } = response;
      const newUser = {
        ...userData,
        token,
      };

      setUser(newUser);
      localStorage.setItem('ganga_guardian_user', JSON.stringify(newUser));
      setLoading(false);
      return newUser;
    } catch (err) {
      setLoading(false);
      const errorMsg = err.message || 'Registration failed.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ganga_guardian_user');
  };

  const value = {
    user,
    loading,
    error: authError,
    login,
    signUp,
    logout,
    clearError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
