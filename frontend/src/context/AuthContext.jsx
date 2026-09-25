import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('earthscape_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('earthscape_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authService.getProfile()
        .then(res => {
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('earthscape_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data && res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('earthscape_token', res.data.token);
      localStorage.setItem('earthscape_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  const register = async (name, email, password, role) => {
    const res = await authService.register({ name, email, password, role });
    if (res.data && res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('earthscape_token', res.data.token);
      localStorage.setItem('earthscape_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('earthscape_token');
    localStorage.removeItem('earthscape_user');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isAnalyst }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);