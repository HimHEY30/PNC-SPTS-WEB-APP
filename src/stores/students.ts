import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

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
      const response = await api.get('/api/students')
      const raw: ApiStudent[] = response.data?.data ?? response.data ?? []
      const fetchedList = raw.map(toDisplay)
      
      // Merge fetched students with local cache to preserve client-side edits (like profileImage)
      const cachedList = loadCached()
      const mergedList = fetchedList.map(f => {
        const cached = cachedList.find(c => c.id === f.id)
        if (cached) {
          return {
            ...f,
            firstName: cached.firstName,
            lastName: cached.lastName,
            name: cached.name,
            email: cached.email,
            phone: cached.phone,
            placeOfBirth: cached.placeOfBirth,
            status: cached.status,
            classId: cached.classId,
            profileImage: cached.profileImage,
            updatedAt: cached.updatedAt,
          }
        }
        return f
      })
      
      students.value = mergedList
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

  return { students, loading, error, fetched, fetchStudents }
})
