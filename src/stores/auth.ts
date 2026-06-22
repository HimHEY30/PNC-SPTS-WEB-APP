import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'
import { loadCachedUser, cacheUser, preseedUserCache, cacheUserRecord, loadUserRecord } from '@/services/auth-cache'
import { buildUser, buildFallbackProfile } from '@/services/auth-helpers'

export type UserProfile = Record<string, unknown> & {
  first_name?: string
  last_name?: string
  email?: string
  profile_image?: string | null
  entity_type?: string
  phone?: string | null
  is_active?: boolean
  status?: string
  roles?: string[]
  name?: string
}

function extractProfile(response: { data: unknown }): UserProfile | null {
  const data = response.data as Record<string, unknown>
  if (data.success && data.data) return data.data as UserProfile
  if ((data as Record<string, unknown>).email) return data as UserProfile
  if (data.data && typeof data.data === 'object' && 'email' in (data.data as Record<string, unknown>)) return data.data as UserProfile
  if (data.user_id) return data as UserProfile
  if (data.data && typeof data.data === 'object' && 'user_id' in (data.data as Record<string, unknown>)) return data.data as UserProfile
  return null
}

function extractToken(response: { data: unknown }): string | null {
  const d = response.data as Record<string, unknown>
  if (d.success && d.data && typeof d.data === 'object' && 'access_token' in (d.data as Record<string, unknown>)) return (d.data as Record<string, unknown>).access_token as string
  if (d.access_token) return d.access_token as string
  if (d.data && typeof d.data === 'object' && 'access_token' in (d.data as Record<string, unknown>)) return (d.data as Record<string, unknown>).access_token as string
  if (d.token) return d.token as string
  return null
}

function isProfileComplete(p: UserProfile | null): boolean {
  return !!(p && p.email && (p.first_name || p.last_name))
}

function extractUsersList(response: { data: unknown }): Record<string, unknown>[] {
  const data = response.data as Record<string, unknown>
  if (data.success && Array.isArray(data.data)) return data.data as Record<string, unknown>[]
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (Array.isArray(data.data)) return data.data as Record<string, unknown>[]
  return []
}

function clearHeuristicCache(email: string): void {
  const key = 'cached_user_record_' + email.toLowerCase()
  const cachedRaw = localStorage.getItem(key)
  if (!cachedRaw) return
  try {
    const cachedObj = JSON.parse(cachedRaw)
    const first = cachedObj?.first_name || ''
    const emailPrefix = email.split('@')[0] || ''
    if (first.toLowerCase() === 'newuser' || first.toLowerCase() === 'user' || first.toLowerCase() === emailPrefix.toLowerCase()) {
      localStorage.removeItem(key)
    }
  } catch {
    localStorage.removeItem(key)
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(!!localStorage.getItem('access_token'))
  const user = ref<UserProfile | null>(loadCachedUser())

  async function fetchProfile() {
    if (!isAuthenticated.value) return null

    preseedUserCache()

    let profileData: UserProfile | null = null
    let apiFailed = false

    try {
      profileData = extractProfile(await api.get('/users/profile'))
    } catch {
      apiFailed = true
    }

    let isComplete = isProfileComplete(profileData)
    const userEmail = localStorage.getItem('user_email')

    if (!isComplete && userEmail) {
      const cached = loadUserRecord(userEmail)
      if (cached) {
        profileData = { ...profileData, ...cached }
        isComplete = isProfileComplete(profileData)
      }
    }

    const userId = (profileData?.id || profileData?.user_id) as string | undefined
    if (!isComplete && userId) {
      try {
        const payload = extractProfile(await api.get(`/users/${userId}`))
        if (payload && (payload.email || payload.first_name)) {
          profileData = { ...profileData, ...payload }
          isComplete = isProfileComplete(profileData)
          apiFailed = false
        }
      } catch {
        // Silently continue
      }
    }

    if (!isComplete) {
      try {
        const usersList = extractUsersList(await api.get('/users'))
        const targetId = profileData?.user_id || profileData?.id
        const found = usersList.find(
          (u) =>
            (targetId && String(u['id']) === targetId) ||
            (userEmail &&
              typeof u['email'] === 'string' &&
              u['email'].toLowerCase() === userEmail.toLowerCase()),
        )
        if (found) {
          profileData = { ...profileData, ...found } as UserProfile
          isComplete = true
          apiFailed = false
        }
      } catch {
        // Silently continue
      }
    }

    if (apiFailed && userEmail) {
      const cached = loadCachedUser()
      if (cached && cached.email === userEmail) {
        user.value = cached
        return cached
      }
    }

    if (!isComplete && userEmail) {
      profileData = buildFallbackProfile(userEmail, profileData)
    }

    if (profileData) {
      const built = buildUser(profileData)
      user.value = built
      cacheUser(built)
      if (built.email) {
        cacheUserRecord(built.email, built)
      }
      return built
    }

    return null
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials)
      const token = extractToken(response)

      if (token) {
        clearHeuristicCache(credentials.email)
        localStorage.removeItem('user_profile')
        localStorage.setItem('access_token', token)
        localStorage.setItem('user_email', credentials.email)
        isAuthenticated.value = true
        await fetchProfile()
        return true
      }
      return false
    } catch (error) {
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('students_cache')
    localStorage.removeItem('teachers_cache')
    localStorage.removeItem('user_profile')
    cacheUser(null)
    isAuthenticated.value = false
    user.value = null
  }

  function updateUserLocal(data: Partial<UserProfile>) {
    if (user.value) {
      user.value = buildUser({ ...user.value, ...data })
      cacheUser(user.value)
    }
  }

  if (isAuthenticated.value) {
    fetchProfile()
  }

  return { isAuthenticated, user, fetchProfile, login, logout, updateUserLocal }
})
