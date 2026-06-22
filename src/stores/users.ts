import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, getErrorMessage } from '@/services/api'

export interface ApiUser {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  profile_image: string | null
  entity_type: string
  is_active: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED'
  last_login_at: string | null
  created_at: string
  updated_at: string
  roles: string[]
}

export interface DisplayUser {
  id: string
  name: string
  username: string
  email: string
  phone: string
  role: string
  status: 'Active' | 'Inactive'
  lastLogin: string
  createdAt: string
  profileImage: string | null
}

function toDisplayUser(u: ApiUser): DisplayUser {
  let lastLogin = '-'
  if (u.last_login_at) {
    try {
      const val = u.last_login_at
      const dateStr = typeof val === 'string' && val.includes(' ') ? val.replace(' ', 'T') : val
      const date = new Date(dateStr as string | number | Date)
      if (!isNaN(date.getTime())) {
        lastLogin = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
    } catch {
      // Silently skip date parsing failures
    }
  }

  let createdAt = '-'
  if (u.created_at) {
    try {
      const val = u.created_at
      const dateStr = typeof val === 'string' && val.includes(' ') ? val.replace(' ', 'T') : val
      const date = new Date(dateStr as string | number | Date)
      if (!isNaN(date.getTime())) {
        createdAt = date.toISOString().split('T')[0]
      }
    } catch {
      // Silently skip date parsing failures
    }
  }

  return {
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    username: u.email.split('@')[0] ?? u.id.slice(0, 8),
    email: u.email,
    phone: u.phone ?? '',
    role: u.roles && u.roles[0] ? u.roles[0] : u.entity_type || 'USER',
    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
    lastLogin,
    createdAt,
    profileImage: u.profile_image ?? null,
  }
}

export interface ApiRole {
  id: string
  name: string
  description: string | null
  permissions: string[]
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<DisplayUser[]>([])
  const rolesList = ref<ApiRole[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function hasToken(): boolean {
    return !!localStorage.getItem('access_token')
  }

  async function fetchUsers() {
    if (!hasToken()) {
      error.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/users')
      const payload = response.data?.data ?? response.data
      const data: ApiUser[] = payload?.data ?? payload ?? []
      users.value = data.map(toDisplayUser)
      data.forEach((u) => {
        if (u.email) {
          localStorage.setItem('cached_user_record_' + u.email.toLowerCase(), JSON.stringify(u))
        }
      })
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch users')
    } finally {
      loading.value = false
    }
  }

  async function fetchRoles() {
    if (!hasToken() || rolesList.value.length > 0) return
    try {
      const response = await api.get('/roles')
      const payload = response.data?.data ?? response.data
      const data: ApiRole[] = payload?.data ?? payload ?? []
      if (data.length > 0) {
        rolesList.value = data
      } else {
        throw new Error('Empty roles list from server')
      }
    } catch {
      rolesList.value = [
        { id: 'role-1', name: 'ADMIN', description: 'Administrator', permissions: [] },
        {
          id: 'role-2',
          name: 'ACADEMIC_MANAGER',
          description: 'Academic Manager',
          permissions: [],
        },
        {
          id: 'role-3',
          name: 'FOLLOWUP_OFFICER',
          description: 'Follow-Up Officer',
          permissions: [],
        },
        { id: 'role-4', name: 'TUTOR', description: 'Tutor / Teacher', permissions: [] },
        { id: 'role-5', name: 'STUDENT', description: 'Student', permissions: [] },
      ]
    }
  }

  async function createUser(
    payload: {
      first_name: string
      last_name: string
      email: string
      password: string
      role: string
      phone?: string
    },
    imageFile?: File | null,
  ) {
    let data: unknown = payload
    let usingFormdata = false
    if (imageFile) {
      usingFormdata = true
      const fd = new FormData()
      fd.append('first_name', payload.first_name)
      fd.append('last_name', payload.last_name)
      fd.append('email', payload.email)
      fd.append('password', payload.password)
      fd.append('role', payload.role)
      if (payload.phone) fd.append('phone', payload.phone)
      fd.append('image', imageFile)
      data = fd
    }

    try {
      const response = await api.post('/users', data)
      const createdRaw = response.data?.data ?? response.data
      const created: ApiUser = createdRaw?.data ?? createdRaw
      if (created && created.email) {
        localStorage.setItem('cached_user_record_' + created.email.toLowerCase(), JSON.stringify(created))
      }
      users.value.unshift(toDisplayUser(created))
      return created
    } catch (e: unknown) {
      if (usingFormdata) {
        const response = await api.post('/users', payload)
        const createdRaw = response.data?.data ?? response.data
        const created: ApiUser = createdRaw?.data ?? createdRaw
        if (created && created.email) {
          localStorage.setItem('cached_user_record_' + created.email.toLowerCase(), JSON.stringify(created))
        }

        // Cache the base64 image preview in localStorage if possible
        try {
          const reader = new FileReader()
          reader.onload = () => {
            if (reader.result) {
              localStorage.setItem('cached_profile_image_' + payload.email, reader.result as string)
              const idx = users.value.findIndex((u) => u.email === payload.email)
              if (idx !== -1) {
                users.value[idx].profileImage = reader.result as string
              }
            }
          }
          reader.readAsDataURL(imageFile!)
        } catch {
          // Silently continue
        }

        users.value.unshift(toDisplayUser(created))
        return created
      } else {
        throw e
      }
    }
  }

  async function updateUser(
    id: string,
    payload: {
      first_name?: string
      last_name?: string
      phone?: string
    },
    imageFile?: File | null,
    email?: string,
  ) {
    let data: unknown = payload
    let usingFormdata = false
    if (imageFile) {
      usingFormdata = true
      const fd = new FormData()
      if (payload.first_name) fd.append('first_name', payload.first_name)
      if (payload.last_name) fd.append('last_name', payload.last_name)
      if (payload.phone) fd.append('phone', payload.phone)
      fd.append('image', imageFile)
      data = fd
    }

    try {
      const response = await api.patch(`/users/${id}`, data)
      const updatedRaw = response.data?.data ?? response.data
      const updated: ApiUser = updatedRaw?.data ?? updatedRaw
      if (updated && updated.email) {
        localStorage.setItem('cached_user_record_' + updated.email.toLowerCase(), JSON.stringify(updated))
      }
      const idx = users.value.findIndex((u) => u.id === id)
      if (idx !== -1) users.value[idx] = toDisplayUser(updated)
      return updated
    } catch (e: unknown) {
      if (usingFormdata) {
        const response = await api.patch(`/users/${id}`, payload)
        const updatedRaw = response.data?.data ?? response.data
        const updated: ApiUser = updatedRaw?.data ?? updatedRaw
        if (updated && updated.email) {
          localStorage.setItem('cached_user_record_' + updated.email.toLowerCase(), JSON.stringify(updated))
        }

        if (email && imageFile) {
          try {
            const reader = new FileReader()
            reader.onload = () => {
              if (reader.result) {
                localStorage.setItem('cached_profile_image_' + email, reader.result as string)
                const idx = users.value.findIndex((u) => u.id === id)
                if (idx !== -1) {
                  users.value[idx].profileImage = reader.result as string
                }
              }
            }
            reader.readAsDataURL(imageFile)
          } catch {
            // Silently continue
          }
        }

        const idx = users.value.findIndex((u) => u.id === id)
        if (idx !== -1) users.value[idx] = toDisplayUser(updated)
        return updated
      } else {
        throw e
      }
    }
  }

  async function assignRole(id: string, role: string) {
    const response = await api.patch(`/users/${id}/role`, { role })
    const updatedRaw = response.data?.data ?? response.data
    const updated: ApiUser = updatedRaw?.data ?? updatedRaw
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function updateUserStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED',
  ) {
    const response = await api.patch(`/users/${id}/status`, { status })
    const updatedRaw = response.data?.data ?? response.data
    const updated: ApiUser = updatedRaw?.data ?? updatedRaw
    const idx = users.value.findIndex((u) => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function deleteUser(id: string) {
    await api.delete(`/users/${id}`)
    users.value = users.value.filter((u) => u.id !== id)
  }

  return {
    users,
    rolesList,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    assignRole,
    updateUserStatus,
    deleteUser,
  }
})
