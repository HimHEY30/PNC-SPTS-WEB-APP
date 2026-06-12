// src/services/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pnc-spts-stg-api.me/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token && !config.url?.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { api }
