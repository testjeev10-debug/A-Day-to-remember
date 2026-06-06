import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('adtr_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const savedUser = localStorage.getItem('adtr_user');
    const savedCompanion = localStorage.getItem('adtr_companion');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCompanion) setCompanion(JSON.parse(savedCompanion));
    setLoading(false);
  }, []);

  const login = (data) => {
    const { token: t, user: u, companion: c } = data;
    setToken(t);
    setUser(u);
    setCompanion(c);
    localStorage.setItem('adtr_token', t);
    localStorage.setItem('adtr_user', JSON.stringify(u));
    if (c) localStorage.setItem('adtr_companion', JSON.stringify(c));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setCompanion(null);
    localStorage.removeItem('adtr_token');
    localStorage.removeItem('adtr_user');
    localStorage.removeItem('adtr_companion');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateCompanion = (c) => {
    setCompanion(c);
    localStorage.setItem('adtr_companion', JSON.stringify(c));
  };

  return (
    <AuthContext.Provider value={{ user, companion, token, loading, login, logout, updateCompanion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
