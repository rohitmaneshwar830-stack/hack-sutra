import React, { createContext, useContext, useState, useEffect } from 'react';

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
    
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@ganga.ai' && password === '123456') {
      const adminUser = {
        email: 'admin@ganga.ai',
        role: 'admin',
        name: 'Rohit Maneshwer', // Matching the core development team frontend dev / admin name
        department: 'Ministry of Jal Shakti',
      };
      setUser(adminUser);
      localStorage.setItem('ganga_guardian_user', JSON.stringify(adminUser));
      setLoading(false);
      return adminUser;
    } else if (cleanEmail === 'citizen@ganga.ai' && password === '123456') {
      const citizenUser = {
        email: 'citizen@ganga.ai',
        role: 'citizen',
        name: 'Citizen User',
        phone: '+91 98765-43210',
      };
      setUser(citizenUser);
      localStorage.setItem('ganga_guardian_user', JSON.stringify(citizenUser));
      setLoading(false);
      return citizenUser;
    } else {
      setLoading(false);
      const errorMsg = 'Invalid email or password. Please use the demo credentials.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const signUp = async (email, password, name) => {
    setAuthError(null);
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail.includes('admin') || cleanEmail.includes('gov')) {
      setLoading(false);
      const errorMsg = 'Government accounts cannot be created via public sign-up.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }

    const newUser = {
      email: cleanEmail,
      role: 'citizen',
      name: name || 'Registered Citizen',
      phone: '',
    };

    setUser(newUser);
    localStorage.setItem('ganga_guardian_user', JSON.stringify(newUser));
    setLoading(false);
    return newUser;
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
