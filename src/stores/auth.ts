// src/stores/auth.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, type LoginCredentials } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<{ email: string; name: string } | null>(null)
  const token = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function login(credentials: LoginCredentials) {
    error.value = null
    try {
      const data = await loginApi(credentials)

      token.value = data.access_token
      localStorage.setItem('auth_token', data.access_token)

      if (data.user) {
        user.value = {
          email: data.user.email,
          name: data.user.name || 'User',
        }
      } else {
        user.value = { email: credentials.email, name: 'Admin' }
      }

      isAuthenticated.value = true
    } catch (err: any) {
      console.error('Login failed:', err)

      // --- SAFE ERROR HANDLING ---
      // We check if the error message exists and is a string.
      // If not, we use a default message.
      let message = 'Login failed. Please check your credentials.'

      if (err.response && err.response.data) {
        // If the API returns a JSON error like { "message": "Invalid credentials" }
        if (typeof err.response.data.message === 'string') {
          message = err.response.data.message
        }
        // If the API returns a string directly
        else if (typeof err.response.data === 'string') {
          message = err.response.data
        }
      } else if (err.message) {
        // Fallback to axios error message (e.g. "Network Error")
        message = err.message
      }

      error.value = message
      isAuthenticated.value = false
      throw err
    }
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
  }

  return { isAuthenticated, user, token, error, login, logout }
})
