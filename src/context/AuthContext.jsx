import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('zentrader_token'));

  useEffect(() => {
    const verifyUser = async () => {
      setLoading(true);
      if (token) {
        try {
          console.log('Verifying token...');
          const res = await api.get('/api/user/profile');
          console.log('User verified:', res.data.email);
          setUser(res.data);
        } catch (err) {
          console.error('Verification failed:', err.response?.data || err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('zentrader_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration...');
      const res = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('zentrader_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('zentrader_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
