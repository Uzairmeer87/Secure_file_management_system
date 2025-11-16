import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setUser({ token });
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/login', { username, password });
      localStorage.setItem('token', res.token);
      setUser({ token: res.token });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.error };
    }
  };

  const register = async (username, password) => {
    try {
      await api.post('/register', { username, password });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.error };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
