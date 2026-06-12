import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, getErrorMessage } from '@/services/api'

export interface ApiStudent {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  gender: 'male' | 'female' | 'other' | null
  dateOfBirth: string | null
  placeOfBirth: string | null
  phone: string | null
  email: string | null
  profileImage: string | null
  status: 'active' | 'suspended' | 'graduated'
  classId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export interface DisplayStudent {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  name: string
  gender: string
  dateOfBirth: string
  placeOfBirth: string
  phone: string
  email: string
  profileImage: string | null
  status: string
  classId: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  createdBy: string
  updatedBy: string
}

const STUDENTS_CACHE_KEY = 'students_cache'

function loadCached(): DisplayStudent[] {
  try {
    const raw = localStorage.getItem(STUDENTS_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function cacheData(data: DisplayStudent[]) {
  try {
    localStorage.setItem(STUDENTS_CACHE_KEY, JSON.stringify(data))
  } catch {
  }
}

function fmt(val: unknown): string {
  if (val === null || val === undefined) return '—'
  return String(val)
}

function toDisplay(s: ApiStudent): DisplayStudent {
  const dob = s.dateOfBirth
    ? new Date(s.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '—'
  const genderMap: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' }
  return {
    id: s.id,
    studentCode: s.studentCode,
    firstName: s.firstName,
    lastName: s.lastName,
    name: `${s.firstName} ${s.lastName}`,
    gender: s.gender ? genderMap[s.gender] ?? s.gender : '—',
    dateOfBirth: dob,
    placeOfBirth: fmt(s.placeOfBirth),
    phone: fmt(s.phone),
    email: fmt(s.email),
    profileImage: s.profileImage,
    status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    classId: fmt(s.classId),
    createdAt: new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }),
    updatedAt: new Date(s.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }),
    deletedAt: s.deletedAt ? new Date(s.deletedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : '—',
    createdBy: fmt(s.createdBy),
    updatedBy: fmt(s.updatedBy),
  }
}

export const useStudentsStore = defineStore('students', () => {
  const students = ref<DisplayStudent[]>(loadCached())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)

  async function fetchStudents() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/students')
      
      const payload = response.data?.data ?? response.data
      let raw: ApiStudent[] = []
      if (Array.isArray(payload)) {
        raw = payload
      } else if (payload && Array.isArray(payload.data)) {
        raw = payload.data
      }

      const fetchedList = raw.map(toDisplay)
      
      students.value = fetchedList
      cacheData(students.value)
      fetched.value = true
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch students'
      if (students.value.length === 0) {
        students.value = loadCached()
      }
    } finally {
      loading.value = false
    }
  }

  async function createStudent(payload: Record<string, unknown>, file?: File | null) {
    loading.value = true
    error.value = null
    try {
      let response;
      if (file) {
        const fd = new FormData()
        fd.append('image', file)
        Object.keys(payload).forEach(key => {
          if (payload[key] !== undefined && payload[key] !== null) {
            fd.append(key, String(payload[key]))
          }
        })
        response = await api.post('/students', fd)
      } else {
        const cleanPayload = { ...payload }
        delete cleanPayload['status']
        delete cleanPayload['profileImage']
        response = await api.post('/students', cleanPayload)
      }
      
      const created: ApiStudent = response.data?.data ?? response.data
      
      // Preserve local profileImage preview if backend didn't return it
      if (!created.profileImage && typeof payload['profileImage'] === 'string') {
        created.profileImage = payload['profileImage']
      }
      
      const disp = toDisplay(created)
      students.value.unshift(disp)
      cacheData(students.value)
      return disp
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to create student')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateStudent(id: string, payload: Record<string, unknown>, file?: File | null) {
    loading.value = true
    error.value = null
    try {
      let response;
      if (file) {
        const fd = new FormData()
        fd.append('image', file)
        Object.keys(payload).forEach(key => {
          if (payload[key] !== undefined && payload[key] !== null) {
            fd.append(key, String(payload[key]))
          }
        })
        response = await api.patch(`/students/${id}`, fd)
      } else {
        const cleanPayload = { ...payload }
        delete cleanPayload['profileImage']
        response = await api.patch(`/students/${id}`, cleanPayload)
      }

      const updated: ApiStudent = response.data?.data ?? response.data
      
      // Preserve local profileImage preview if backend didn't return it
      if (!updated.profileImage && typeof payload['profileImage'] === 'string') {
        updated.profileImage = payload['profileImage']
      }
      
      const disp = toDisplay(updated)
      const idx = students.value.findIndex(s => s.id === id)
      if (idx !== -1) {
        students.value[idx] = disp
      }
      cacheData(students.value)
      return disp
    } catch (e: unknown) {
      error.value = getErrorMessage(e, 'Failed to update student')
      throw e
    } finally {
      loading.value = false
    }
  }

  return { 
    students, 
    loading, 
    error, 
    fetched, 
    fetchStudents, 
    createStudent, 
    updateStudent 
  }
})
