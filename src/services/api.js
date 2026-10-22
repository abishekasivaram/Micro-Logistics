import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? 'https://micro-logistics.onrender.com/api/v1' : 'http://localhost:5000/api/v1'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Supabase token and user identity
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    const savedUserStr = localStorage.getItem('micrologi_currentUser');
    if (savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      if (savedUser?.id) {
        config.headers['x-user-id'] = savedUser.id;
      }
      if (savedUser?.role) {
        config.headers['x-user-role'] = savedUser.role;
      }
    }
  } catch (e) {
    // Graceful fallback
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Global response error handler
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    console.error("Unauthorized API call. You may need to log in again.");
    // Optionally trigger a logout flow here if needed
  }
  return Promise.reject(error);
});

export default api;
