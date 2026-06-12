// src/service/api.ts
import axios from 'axios'

// Create the axios instance
const api = axios.create({
  // Use relative path. Vite will intercept this.
  baseURL: '/api',

  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// 1. REQUEST INTERCEPTOR
// This runs BEFORE every request you make.
// It checks if you have a token in localStorage and adds it to the headers.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')

    if (token) {
      // Attach the token to the Authorization header
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 2. RESPONSE INTERCEPTOR
// This runs AFTER every response comes back from the server.
api.interceptors.response.use(
  (response) => {
    // If the response is successful (status 200-299), just return it
    return response
  },
  (error) => {
    // If there is an error (status 400, 401, 500, etc.)
    if (error.response?.status === 401) {
      // 401 means "Unauthorized" - the token is bad or expired.
      // Force logout logic here
      console.warn('Session expired. Logging out...')
      localStorage.removeItem('auth_token')
      // You might want to redirect to login here using window.location.href
      // or emit an event, but typically we handle the redirect in the store or router guard.
    }

    return Promise.reject(error)
  }
)

export default api
