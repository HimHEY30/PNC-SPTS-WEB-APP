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
    role: u.roles[0] ?? u.entity_type,
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
      const response = await api.get('/api/users')
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
      const response = await api.get('/api/roles')
      const data: ApiRole[] = response.data?.data ?? response.data ?? []
      rolesList.value = data
    } catch {
      // roles fetch is non-critical
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
    let data: any = payload
    if (imageFile) {
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
    const response = await api.post('/api/users', data)
    const created: ApiUser = response.data?.data ?? response.data
    users.value.unshift(toDisplayUser(created))
    return created
  }

  async function updateUser(
    id: string,
    payload: {
      first_name?: string
      last_name?: string
      phone?: string
    },
    imageFile?: File | null
  ) {
    let data: any = payload
    if (imageFile) {
      const fd = new FormData()
      if (payload.first_name) fd.append('first_name', payload.first_name)
      if (payload.last_name) fd.append('last_name', payload.last_name)
      if (payload.phone) fd.append('phone', payload.phone)
      fd.append('image', imageFile)
      data = fd
    }
    const response = await api.patch(`/api/users/${id}`, data)
    const updated: ApiUser = response.data?.data ?? response.data
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function assignRole(id: string, role: string) {
    const response = await api.patch(`/api/users/${id}/role`, { role })
    const updated: ApiUser = response.data?.data ?? response.data
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function updateUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED') {
    const response = await api.patch(`/api/users/${id}/status`, { status })
    const updated: ApiUser = response.data?.data ?? response.data
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) users.value[idx] = toDisplayUser(updated)
    return updated
  }

  async function deleteUser(id: string) {
    await api.delete(`/api/users/${id}`)
    users.value = users.value.filter(u => u.id !== id)
  }

  return { users, rolesList, loading, error, fetchUsers, fetchRoles, createUser, updateUser, assignRole, updateUserStatus, deleteUser }
})
