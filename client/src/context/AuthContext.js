import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const Ctx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hd_token');
    if (!token) { setLoading(false); return; }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem('hd_token'); delete api.defaults.headers.common['Authorization']; })
      .finally(() => setLoading(false));
  }, []);

  const _setToken = (token) => {
    localStorage.setItem('hd_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    _setToken(data.token); setUser(data.user); return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    _setToken(data.token); setUser(data.user); return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hd_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
};

export const useAuth = () => { const c = useContext(Ctx); if(!c) throw new Error('useAuth outside AuthProvider'); return c; };
