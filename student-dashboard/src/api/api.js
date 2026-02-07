import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for refreshing tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login') && !originalRequest.url.includes('/auth/refresh-token')) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        await api.post('/auth/refresh-token');
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Session expired:', refreshError);
        // Do not redirect if we are already on public pages? 
        // But context will handle user state
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
