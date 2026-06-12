import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export interface ApiTeacher {
  id: string
  teacherCode: string
  firstName: string
  lastName: string
  phone: string | null
  status: boolean
  userId: string
  email: string
  profileImage: string | null
  sections: number
  students: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export interface DisplayTeacher {
  id: string
  teacherCode: string
  firstName: string
  lastName: string
  name: string
  phone: string
  status: 'Active' | 'Inactive'
  userId: string
  email: string
  profileImage: string | null
  sections: number
  students: number
  joinedAt: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  createdBy: string
  updatedBy: string
}

const TEACHERS_CACHE_KEY = 'teachers_cache'

function loadCached(): DisplayTeacher[] {
  try {
    const raw = localStorage.getItem(TEACHERS_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function cacheData(data: DisplayTeacher[]) {
  try {
    localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(data))
  } catch {}
}

function fmt(val: unknown): string {
  if (val === null || val === undefined) return '—'
  return String(val)
}

function toDisplay(t: ApiTeacher): DisplayTeacher {
  return {
    id: t.id,
    teacherCode: t.teacherCode,
    firstName: t.firstName,
    lastName: t.lastName,
    name: `${t.firstName} ${t.lastName}`,
    phone: fmt(t.phone),
    status: t.status ? 'Active' : 'Inactive',
    userId: t.userId,
    email: fmt(t.email),
    profileImage: t.profileImage ?? null,
    sections: t.sections,
    students: t.students,
    joinedAt: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : '—',
    createdAt: t.createdAt
      ? new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
      : '—',
    updatedAt: t.updatedAt
      ? new Date(t.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
      : '—',
    deletedAt: t.deletedAt
      ? new Date(t.deletedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
      : '—',
    createdBy: fmt(t.createdBy),
    updatedBy: fmt(t.updatedBy),
  }
}

export const useTeachersStore = defineStore('teachers', () => {
  const teachers = ref<DisplayTeacher[]>(loadCached())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)

  async function fetchTeachers() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/api/teachers')
      const raw: ApiTeacher[] = response.data?.data ?? response.data ?? []
      const fetchedList = raw.map(toDisplay)

      // Directly update the store & cache with fresh server data to fix the sync delay issue
      teachers.value = fetchedList
      cacheData(teachers.value)
      fetched.value = true
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch teachers'
      if (teachers.value.length === 0) {
        teachers.value = loadCached()
      }
    } finally {
      loading.value = false
    }
  }

  async function createTeacher(
    payload: {
      teacherCode: string
      firstName: string
      lastName: string
      email: string
      phone?: string
      status: boolean
    },
    imageFile?: File | null
  ) {
    loading.value = true
    error.value = null
    try {
      let data: any = payload
      if (imageFile) {
        const fd = new FormData()
        fd.append('teacherCode', payload.teacherCode)
        fd.append('firstName', payload.firstName)
        fd.append('lastName', payload.lastName)
        fd.append('email', payload.email)
        if (payload.phone) fd.append('phone', payload.phone)
        fd.append('status', String(payload.status))
        fd.append('image', imageFile)
        data = fd
      }
      const response = await api.post('/api/teachers', data)
      const created: ApiTeacher = response.data?.data ?? response.data
      const disp = toDisplay(created)
      teachers.value.unshift(disp)
      cacheData(teachers.value)
      return disp
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to create teacher'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTeacher(
    id: string,
    payload: {
      firstName?: string
      lastName?: string
      phone?: string
      email?: string
      status?: boolean
    },
    imageFile?: File | null
  ) {
    loading.value = true
    error.value = null
    try {
      let data: any = payload
      if (imageFile) {
        const fd = new FormData()
        if (payload.firstName) fd.append('firstName', payload.firstName)
        if (payload.lastName) fd.append('lastName', payload.lastName)
        if (payload.email) fd.append('email', payload.email)
        if (payload.phone) fd.append('phone', payload.phone)
        if (payload.status !== undefined) fd.append('status', String(payload.status))
        fd.append('image', imageFile)
        data = fd
      }
      const response = await api.patch(`/api/teachers/${id}`, data)
      const updated: ApiTeacher = response.data?.data ?? response.data
      const disp = toDisplay(updated)
      const idx = teachers.value.findIndex((t) => t.id === id)
      if (idx !== -1) {
        teachers.value[idx] = disp
      }
      cacheData(teachers.value)
      return disp
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to update teacher'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTeacher(id: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/api/teachers/${id}`)
      teachers.value = teachers.value.filter((t) => t.id !== id)
      cacheData(teachers.value)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to delete teacher'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teachers,
    loading,
    error,
    fetched,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
  }
})
