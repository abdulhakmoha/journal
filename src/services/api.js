import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://journal-production-6346.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('somtrader_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('somtrader_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
