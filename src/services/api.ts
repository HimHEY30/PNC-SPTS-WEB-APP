import axios from 'axios';

// Create a configured axios instance
export const api = axios.create({
  // Use /api as the base for all requests during development (proxied by Vite).
  // In production, use VITE_API_BASE_URL or fallback to local backend.
  baseURL: import.meta.env.DEV
    ? '/api'
    : (import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:3000/api'),
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

/**
 * Global helper to extract and format backend validation, conflict, and network errors.
 */
export function getErrorMessage(err: unknown, fallback: string = 'An error occurred'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response: unknown }).response;
    if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as { data: unknown }).data;
      if (data && typeof data === 'object') {
        const errorVal = (data as { error?: string }).error;
        const messageVal = (data as { message?: string | string[] }).message;
        
        const actualKey = errorVal || (typeof messageVal === 'string' ? messageVal : undefined);
        if (actualKey === 'EMAIL_ALREADY_EXISTS') {
          return 'This email address is already in use.';
        }
        if (actualKey === 'PHONE_ALREADY_EXISTS') {
          return 'This phone number is already in use.';
        }
        if (actualKey === 'ROLE_ALREADY_EXISTS') {
          return 'This role name is already in use.';
        }

        if (messageVal) {
          if (Array.isArray(messageVal)) {
            return messageVal.join(', ');
          }
          if (typeof messageVal === 'string' && messageVal !== 'Conflict' && messageVal !== 'Bad Request') {
            return messageVal;
          }
        }

        if (errorVal && typeof errorVal === 'string' && errorVal !== 'Conflict' && errorVal !== 'Bad Request') {
          return errorVal.replace(/_/g, ' ');
        }
      }
    }
  }
  
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return fallback;
}

