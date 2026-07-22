import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { AuthContext } from './context';

const STORAGE_KEY = 'ganga_guardian_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return setLoading(false);
      try {
        const session = JSON.parse(saved);
        if (!session.token) throw new Error('Session token missing.');
        const response = await api.get('/auth/me');
        const restored = { ...response.user, token: session.token };
        setUser(restored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const saveSession = (response) => {
    const session = { ...response.user, token: response.token };
    setUser(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  };

  const login = async (email, password) => {
    setAuthError(null); setLoading(true);
    try { return saveSession(await api.post('/auth/login', { email: email.trim().toLowerCase(), password })); }
    catch (error) { setAuthError(error.message); throw error; }
    finally { setLoading(false); }
  };

  const signUp = async (email, password, name, inviteToken = '') => {
    setAuthError(null); setLoading(true);
    try { return saveSession(await api.post('/auth/register', { email: email.trim().toLowerCase(), password, name, ...(inviteToken ? { inviteToken } : {}) })); }
    catch (error) { setAuthError(error.message); throw error; }
    finally { setLoading(false); }
  };

  const logout = () => { setUser(null); localStorage.removeItem(STORAGE_KEY); };
  return <AuthContext.Provider value={{ user, loading, error: authError, login, signUp, logout, clearError: () => setAuthError(null) }}>{children}</AuthContext.Provider>;
}
