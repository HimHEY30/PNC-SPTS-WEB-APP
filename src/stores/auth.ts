import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

type UserProfile = Record<string, unknown> & {
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

const USER_CACHE_KEY = 'user_profile'

function loadCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as UserProfile
  } catch {
    return null
  }
}

function cacheUser(u: UserProfile | null) {
  if (u) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
  } else {
    localStorage.removeItem(USER_CACHE_KEY)
  }
}

function buildUser(data: UserProfile): UserProfile {
  const email = data.email || ''
  const localImage = email ? localStorage.getItem('cached_profile_image_' + email) : null
  return {
    ...data,
    profile_image: localImage || data.profile_image || null,
    name: [data.first_name, data.last_name].filter((v): v is string => !!v).join(' ') || data.email || 'User',
  }
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(!!localStorage.getItem('access_token'))
  const user = ref<UserProfile | null>(loadCachedUser())

  async function fetchProfile() {
    try {
      if (!isAuthenticated.value) return null

      let profileData: UserProfile | null = null

      // Attempt 1: Try /users/profile endpoint
      try {
        const response = await api.get('/users/profile')
        if (response.data) {
          if (response.data.success && response.data.data) {
            profileData = response.data.data as UserProfile
          } else if (response.data.email) {
            profileData = response.data as UserProfile
          } else if (response.data.data && response.data.data.email) {
            profileData = response.data.data as UserProfile
          } else if (response.data.user_id) {
            // If the staging server returns only the JWT payload (e.g. user_id, entity_type, roles)
            profileData = response.data as UserProfile
          } else if (response.data.data && response.data.data.user_id) {
            profileData = response.data.data as UserProfile
          }
        }
      } catch (err) {
        console.warn('Failed to fetch from /users/profile, attempting fallback to /users list...', err)
      }

      // Check if profileData has names and email. If not, we need to fetch them from users list or heuristics.
      const isComplete = !!(profileData && profileData.email && (profileData.first_name || profileData.last_name))

      // Attempt 2: Fallback to /users endpoint if profileData is incomplete
      const userEmail = localStorage.getItem('user_email')
      if (!isComplete) {
        try {
          const response = await api.get('/users')
          let usersList: Record<string, unknown>[] = []
          if (response.data?.success && Array.isArray(response.data.data)) {
            usersList = response.data.data as Record<string, unknown>[]
          } else if (Array.isArray(response.data)) {
            usersList = response.data as Record<string, unknown>[]
          } else if (Array.isArray(response.data?.data)) {
            usersList = response.data.data as Record<string, unknown>[]
          }

          // Match by user_id/id or email
          const targetId = profileData?.user_id || profileData?.id
          const found = usersList.find((u) => 
            (targetId && String(u['id']) === targetId) || 
            (userEmail && typeof u['email'] === 'string' && u['email'].toLowerCase() === userEmail.toLowerCase())
          )
          
          if (found) {
            // Keep roles and other fields from profileData if they are not in the found object
            profileData = {
              ...profileData,
              ...found
            } as UserProfile
            console.log('Successfully retrieved complete user profile from users list for id:', targetId)
          }
        } catch (err) {
          console.warn('Fallback to /users list failed:', err)
        }
      }

      // Re-evaluate completeness
      const isNowComplete = !!(profileData && profileData.email && (profileData.first_name || profileData.last_name))

      // Attempt 3: Local heuristics fallback using email address if still incomplete
      if (!isNowComplete && userEmail) {
        const cached = loadCachedUser()
        if (cached && cached.email === userEmail && cached.first_name) {
          profileData = cached
        } else {
          // Parse name from email (e.g. superadmin@example.com -> Super Admin)
          const namePart = userEmail.split('@')[0] || 'User'
          const parts = namePart.split(/[\._-]/)
          const first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'User'
          const last = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : ''
          
          profileData = {
            ...profileData,
            email: userEmail,
            first_name: first,
            last_name: last,
            entity_type: profileData?.entity_type || (userEmail.includes('admin') ? 'admin' : 'user'),
            roles: profileData?.roles || (userEmail.includes('admin') ? ['ADMIN'] : ['USER']),
          }
        }
      }

      if (profileData) {
        user.value = buildUser(profileData)
        cacheUser(user.value)
        return user.value
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
    return null
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/login', credentials)
      let token: string | null = null

      if (response.data) {
        if (response.data.success && response.data.data?.access_token) {
          token = response.data.data.access_token
        } else if (response.data.access_token) {
          token = response.data.access_token
        } else if (response.data.data?.access_token) {
          token = response.data.data.access_token
        } else if (response.data.token) {
          token = response.data.token
        }
      }

      if (token) {
        localStorage.setItem('access_token', token)
        localStorage.setItem('user_email', credentials.email)
        isAuthenticated.value = true

        await fetchProfile()

        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
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
      user.value = buildUser({
        ...user.value,
        ...data,
      })
      cacheUser(user.value)
    }
  }

  // Auto-fetch profile on store initialization if token is present
  if (isAuthenticated.value) {
    fetchProfile()
  }

  return { isAuthenticated, user, fetchProfile, login, logout, updateUserLocal }
})

