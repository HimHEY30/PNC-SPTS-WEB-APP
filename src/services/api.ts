import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  // Use the Vite proxy during local development to bypass CORS.
  // In production, use the environment variable or fallback to the staging URL.
  baseURL: import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://pnc-spts-stg-api.me'),
  headers: {},
});

// Intercept requests to add the Authorization token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Do not attach token for authentication routes (login, register, etc)
    const isAuthRoute = config.url && config.url.includes('/auth/');
    
    if (token && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Intercept responses to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and other cached credentials if unauthorized
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('user_email');
      
      // Redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
