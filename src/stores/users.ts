import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

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
  return {
    id: u.id,
    name: `${u.first_name} ${u.last_name}`,
    username: u.email.split('@')[0] ?? u.id.slice(0, 8),
    email: u.email,
    phone: u.phone ?? '',
    role: (u.roles && u.roles[0]) ? u.roles[0] : (u.entity_type || 'USER'),
    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
    lastLogin: u.last_login_at
      ? new Date(u.last_login_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-',
    createdAt: u.created_at
      ? new Date(u.created_at).toISOString().split('T')[0]
      : '-',
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
      const data: ApiUser[] = response.data?.data ?? response.data ?? []
      users.value = data.map(toDisplayUser)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch users'
    } finally {
      loading.value = false
    }
  }

  async function fetchRoles() {
    if (!hasToken() || rolesList.value.length > 0) return
    try {
      const response = await api.get('/roles')
      const data: ApiRole[] = response.data?.data ?? response.data ?? []
      if (data.length > 0) {
        rolesList.value = data
      } else {
        throw new Error('Empty roles list from server')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('Failed to fetch roles from API, falling back to default system roles:', msg)
      rolesList.value = [
        { id: 'role-1', name: 'ADMIN', description: 'Administrator', permissions: [] },
        { id: 'role-2', name: 'ACADEMIC_MANAGER', description: 'Academic Manager', permissions: [] },
        { id: 'role-3', name: 'FOLLOWUP_OFFICER', description: 'Follow-Up Officer', permissions: [] },
        { id: 'role-4', name: 'TUTOR', description: 'Tutor / Teacher', permissions: [] },
        { id: 'role-5', name: 'STUDENT', description: 'Student', permissions: [] }
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
    imageFile?: File | null
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
      const created: ApiUser = response.data?.data ?? response.data
      users.value.unshift(toDisplayUser(created))
      return created
    } catch (err: unknown) {
      if (usingFormdata) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('Multipart user creation failed, retrying as JSON without image...', msg)
        const response = await api.post('/users', payload)
        const created: ApiUser = response.data?.data ?? response.data
        
        // Cache the base64 image preview in localStorage if possible
        try {
          const reader = new FileReader()
          reader.onload = () => {
            if (reader.result) {
              localStorage.setItem('cached_profile_image_' + payload.email, reader.result as string)
              // Refresh this user in lists if they match
              const idx = users.value.findIndex(u => u.email === payload.email)
              if (idx !== -1) {
                users.value[idx].profileImage = reader.result as string
              }
            }
          }
          reader.readAsDataURL(imageFile!)
        } catch (cacheErr) {
          console.warn('Failed to cache user image locally:', cacheErr)
        }
        
        users.value.unshift(toDisplayUser(created))
        return created
      } else {
        throw err
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
    email?: string
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
      const updated: ApiUser = response.data?.data ?? response.data
      const idx = users.value.findIndex(u => u.id === id)
      if (idx !== -1) users.value[idx] = toDisplayUser(updated)
      return updated
    } catch (err: unknown) {
      if (usingFormdata) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn('Multipart user update failed, retrying as JSON without image...', msg)
        const response = await api.patch(`/users/${id}`, payload)
        const updated: ApiUser = response.data?.data ?? response.data
        
        if (email && imageFile) {
          try {
            const reader = new FileReader()
            reader.onload = () => {
              if (reader.result) {
                localStorage.setItem('cached_profile_image_' + email, reader.result as string)
                const idx = users.value.findIndex(u => u.id === id)
                if (idx !== -1) {
                  users.value[idx].profileImage = reader.result as string
                }
              }
            }
            reader.readAsDataURL(imageFile)
          } catch (cacheErr) {
            console.warn('Failed to cache user image locally:', cacheErr)
          }
        }
        
        const idx = users.value.findIndex(u => u.id === id)
        if (idx !== -1) users.value[idx] = toDisplayUser(updated)
        return updated
      } else {
        throw err
      }
    }
  }

  async function assignRole(id: string, role: string) {
    const response = await api.patch(`/users/${id}/role`, { role })
    const updated: ApiUser = response.data?.data ?? response.data
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED') {
    const response = await api.patch(`/users/${id}/status`, { status })
    const updated: ApiUser = response.data?.data ?? response.data
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function deleteUser(id: string) {
    await api.delete(`/users/${id}`)
    users.value = users.value.filter(u => u.id !== id)
  }

  return { users, rolesList, loading, error, fetchUsers, fetchRoles, createUser, updateUser, assignRole, updateUserStatus, deleteUser }
})
