// Handles login/logout for the whole app
// Any component can call useAuthStore() to check if someone is logged in

import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  // Track whether user is logged in and who they are
  const isAuthenticated = ref(false)
  const user = ref<{ email: string; name: string } | null>(null)

  // Demo login - always works, no real auth yet
  function login() {
    isAuthenticated.value = true
    user.value = { email: 'admin@admin.com', name: 'Admin' }
  }

  // Clear everything on logout
  function logout() {
    isAuthenticated.value = false
    user.value = null
  }

  return { isAuthenticated, user, login, logout }
})
