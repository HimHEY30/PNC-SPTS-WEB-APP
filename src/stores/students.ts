import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, getErrorMessage } from '@/services/api'
import type { CreateStudentPayload, UpdateStudentPayload } from '@/types/student'

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
  } catch {}
}

function fmt(val: unknown): string {
  if (val === null || val === undefined) return '—'
  return String(val)
}

// Normalize API response that may contain snake_case or camelCase fields
function toApiStudent(data: Record<string, unknown>): ApiStudent {
  return {
    id: (data.id ?? '') as string,
    studentCode: (data.studentCode ?? data.student_code ?? '') as string,
    firstName: (data.firstName ?? data.first_name ?? '') as string,
    lastName: (data.lastName ?? data.last_name ?? '') as string,
    gender: (data.gender ?? null) as 'male' | 'female' | 'other' | null,
    dateOfBirth: (data.dateOfBirth ?? data.date_of_birth ?? null) as string | null,
    placeOfBirth: (data.placeOfBirth ?? data.place_of_birth ?? null) as string | null,
    phone: (data.phone ?? null) as string | null,
    email: (data.email ?? null) as string | null,
    profileImage: (data.profileImage ?? data.profile_image ?? null) as string | null,
    status: (data.status ?? 'active') as 'active' | 'suspended' | 'graduated',
    classId: (data.classId ?? data.class_id ?? null) as string | null,
    createdAt: (data.createdAt ?? data.created_at ?? '') as string,
    updatedAt: (data.updatedAt ?? data.updated_at ?? '') as string,
    deletedAt: (data.deletedAt ?? data.deleted_at ?? null) as string | null,
    createdBy: (data.createdBy ?? data.created_by ?? null) as string | null,
    updatedBy: (data.updatedBy ?? data.updated_by ?? null) as string | null,
  }
}

function toDisplay(s: ApiStudent): DisplayStudent {
  const dob = s.dateOfBirth
    ? new Date(s.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '—'
  const genderMap: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' }
  return {
    id: s.id,
    studentCode: s.studentCode,
    firstName: s.firstName,
    lastName: s.lastName,
    name: `${s.firstName} ${s.lastName}`,
    gender: s.gender ? (genderMap[s.gender] ?? s.gender) : '—',
    dateOfBirth: dob,
    placeOfBirth: fmt(s.placeOfBirth),
    phone: fmt(s.phone),
    email: fmt(s.email),
    profileImage: s.profileImage,
    status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    classId: fmt(s.classId),
    createdAt: new Date(s.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    updatedAt: new Date(s.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }),
    deletedAt: s.deletedAt
      ? new Date(s.deletedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        })
      : '—',
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

      // Unwrap nested response: { data: { data: [...] } }
      const payload = response.data?.data ?? response.data
      const unwrapped = payload?.data ?? payload
      let raw: ApiStudent[] = []
      if (Array.isArray(unwrapped)) {
        raw = unwrapped
      }

      const fetchedList = raw.map((item) => toDisplay(toApiStudent(item as unknown as Record<string, unknown>)))

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

  async function createStudent(payload: CreateStudentPayload, file?: File | null) {
    loading.value = true
    error.value = null
    try {
      const body = { ...payload } as Record<string, unknown>
      if (body.profileImage === undefined) {
        delete body.profileImage
      }

      let response
      if (file) {
        const fd = new FormData()
        fd.append('image', file)
        Object.keys(body).forEach((key) => {
          if (body[key] !== undefined && body[key] !== null) {
            fd.append(key, String(body[key]))
          }
        })
        response = await api.post('/students', fd)
      } else {
        response = await api.post('/students', body)
      }

      // Unwrap nested response: { data: { data: actualObject } }
      const createdRaw = response.data?.data ?? response.data
      const created = createdRaw?.data ?? createdRaw

      const disp = toDisplay(toApiStudent(created))
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

  async function updateStudent(id: string, payload: UpdateStudentPayload, file?: File | null) {
    loading.value = true
    error.value = null
    try {
      const body = { ...payload } as Record<string, unknown>
      if (body.profileImage === undefined) {
        delete body.profileImage
      }

      let response
      if (file) {
        const fd = new FormData()
        fd.append('image', file)
        Object.keys(body).forEach((key) => {
          if (body[key] !== undefined && body[key] !== null) {
            fd.append(key, String(body[key]))
          }
        })
        response = await api.patch(`/students/${id}`, fd)
      } else {
        response = await api.patch(`/students/${id}`, body)
      }

      // Unwrap nested response: { data: { data: actualObject } }
      const updatedRaw = response.data?.data ?? response.data
      const updated = updatedRaw?.data ?? updatedRaw

      if (!updated || !updated.id && !(updated.firstName || updated.first_name)) {
        return await fetchStudentById(id)
      }

      const disp = toDisplay(toApiStudent(updated))
      const idx = students.value.findIndex((s) => s.id === id)
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

  async function fetchStudentById(id: string) {
    loading.value = true
    error.value = null
    try {
      const response = await api.get(`/students/${id}`)
      const payload = response.data?.data ?? response.data
      const unwrapped = payload?.data ?? payload
      const disp = toDisplay(toApiStudent(unwrapped))
      
      const idx = students.value.findIndex((s) => s.id === id)
      if (idx !== -1) {
        students.value[idx] = disp
      } else {
        students.value.push(disp)
      }
      cacheData(students.value)
      return disp
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string }
      error.value = err?.response?.data?.message ?? err?.message ?? 'Failed to fetch student details'
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
    fetchStudentById,
    createStudent,
    updateStudent,
  }
})
