// src/utils/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pnc-spts-stg-api.me', // Your API Base URL
  headers: {
    'Content-Type': 'application/json',
    // Add any other global headers here if needed
  },
})

// Optional: Intercept responses to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle logout or token refresh here later
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

export default api
