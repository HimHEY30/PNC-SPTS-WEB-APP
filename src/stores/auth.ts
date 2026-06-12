import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

type UserProfile = Record<string, unknown> & {
  first_name?: string
  last_name?: string
  email?: string
  profile_image?: string | null
  name?: string
}

const USER_CACHE_KEY = 'user_profile'

function loadCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

function cacheUser(u: UserProfile | null) {
  if (u) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
  else localStorage.removeItem(USER_CACHE_KEY)
}

function buildUser(data: UserProfile): UserProfile {
  return {
    ...data,
    name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email || 'User',
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(!!localStorage.getItem('access_token'))
  const user = ref<UserProfile | null>(loadCachedUser())

  async function fetchProfile() {
    try {
      if (!isAuthenticated.value) return null
      const response = await api.get('/users/profile')
      if (response.data?.success) {
        const data = response.data.data as UserProfile
        user.value = buildUser(data)
        cacheUser(user.value)
        return user.value
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
    return null
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      localStorage.removeItem('access_token')
      const response = await api.post('/auth/login', credentials)
      if (response.data?.success && response.data?.data?.access_token) {
        const token = response.data.data.access_token
        localStorage.setItem('access_token', token)
        localStorage.setItem('user_email', credentials.email)
        isAuthenticated.value = true

        await fetchProfile()
        return true
      }
      return false
    } catch (error: any) {
      console.error('Login Error:', error)
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem(USER_CACHE_KEY)
    isAuthenticated.value = false
    user.value = null
  }

  function updateUserLocal(data: Partial<UserProfile>) {
    if (user.value) {
      user.value = buildUser({ ...user.value, ...data })
      cacheUser(user.value)
    }
  }

  return { isAuthenticated, user, fetchProfile, login, logout, updateUserLocal }
})
