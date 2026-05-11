import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://journal-production-7965.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zentrader_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
