import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api, getErrorMessage } from '@/services/api'
import { useStudentsStore } from './students'
import { useUsersStore } from './users'

export interface ApiCase {
  id: string
  studentId: string
  student?: {
    id: string
    firstName: string
    lastName: string
    studentCode: string
  }
  openedByTeacherId: string
  openedByTeacher?: {
    id: string
    first_name?: string
    last_name?: string
    name?: string
  }
  termId: string
  title: string
  description: string
  priority: string
  status: string
  createdAt: string | Record<string, unknown>
  updatedAt: string | Record<string, unknown>
  deletedAt: string | null
  createdBy: string | null
  updatedBy: string | null
  type?: string
}

export interface DisplayCase {
  id: string
  studentId: string
  student: string
  studentCode: string
  teacherId: string
  teacher: string
  termId: string
  type: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  subject: string
  openedDate: string
  lastUpdate: string
  description: string
}

const CASES_CACHE_KEY = 'follow_up_cases_cache'

function loadCached(): DisplayCase[] {
  try {
    const raw = localStorage.getItem(CASES_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function cacheData(data: DisplayCase[]) {
  try {
    localStorage.setItem(CASES_CACHE_KEY, JSON.stringify(data))
  } catch {}
}

function parseDateStr(val: unknown): string {
  if (!val) return '—'
  try {
    let date: Date
    if (val instanceof Date) {
      date = val
    } else if (typeof val === 'string') {
      const clean = val.includes(' ') ? val.replace(' ', 'T') : val
      date = new Date(clean)
    } else if (
      typeof val === 'object' &&
      val &&
      'toISOString' in val &&
      typeof (val as Record<string, unknown>).toISOString === 'function'
    ) {
      date = new Date((val as { toISOString: () => string }).toISOString())
    } else {
      date = new Date(String(val))
    }
    if (isNaN(date.getTime())) return '—'
    return date.toISOString().split('T')[0]
  } catch {
    return '—'
  }
}

export const useCasesStore = defineStore('cases', () => {
  const cases = ref<DisplayCase[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)

  const studentsStore = useStudentsStore()
  const usersStore = useUsersStore()

  function toDisplayCase(c: ApiCase): DisplayCase {
    // 1. Resolve Student Name and Code
    let studentName = 'Unknown Student'
    let studentCode = ''
    if (c.student) {
      studentName = `${c.student.firstName} ${c.student.lastName}`.trim()
      studentCode = c.student.studentCode
    } else {
      const match = studentsStore.students.find((s) => s.id === c.studentId)
      if (match) {
        studentName = match.name
        studentCode = match.studentCode
      }
    }

    // 2. Resolve Teacher Name
    let teacherName = 'Unknown Teacher'
    if (c.openedByTeacher) {
      if (c.openedByTeacher.name) {
        teacherName = c.openedByTeacher.name
      } else if (c.openedByTeacher.first_name || c.openedByTeacher.last_name) {
        teacherName = `${c.openedByTeacher.first_name ?? ''} ${c.openedByTeacher.last_name ?? ''}`.trim()
      }
    } else {
      const match = usersStore.users.find((u) => u.id === c.openedByTeacherId)
      if (match) {
        teacherName = match.name
      }
    }

    // 3. Resolve Priority
    let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium'
    const pLower = (c.priority || '').toLowerCase()
    if (pLower === 'critical') priority = 'Critical'
    else if (pLower === 'high') priority = 'High'
    else if (pLower === 'medium') priority = 'Medium'
    else if (pLower === 'low') priority = 'Low'

    // 4. Resolve Status
    let status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' = 'Open'
    const sLower = (c.status || '').toLowerCase().replace(/_/g, ' ')
    if (sLower === 'open') status = 'Open'
    else if (sLower === 'in progress') status = 'In Progress'
    else if (sLower === 'resolved') status = 'Resolved'
    else if (sLower === 'closed') status = 'Closed'

    return {
      id: c.id,
      studentId: c.studentId,
      student: studentName,
      studentCode: studentCode,
      teacherId: c.openedByTeacherId,
      teacher: teacherName,
      termId: c.termId,
      type: c.type || 'Academic', // default type if not present
      priority,
      status,
      subject: c.title,
      openedDate: parseDateStr(c.createdAt),
      lastUpdate: parseDateStr(c.updatedAt),
      description: c.description,
    }
  }

  async function fetchCases() {
    loading.value = true
    error.value = null
    try {
      // Ensure student and user cache/stores are fetched to resolve names
      if (!studentsStore.fetched) await studentsStore.fetchStudents()
      if (usersStore.users.length === 0) await usersStore.fetchUsers()


      const res = await api.get('/follow-up/cases')
      const payload = res.data?.data ?? res.data
      const raw = payload?.data ?? payload ?? []
      const mapped = Array.isArray(raw) ? raw.map(toDisplayCase) : []
      cases.value = mapped
      cacheData(mapped)
      fetched.value = true
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to fetch follow-up cases')
      // Fallback to cache if API fails
      const cached = loadCached()
      if (cached.length > 0) {
        cases.value = cached
      }
    } finally {
      loading.value = false
    }
  }

  async function createCase(payload: {
    studentId: string
    title: string
    description: string
    priority: string
    termId?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const body = {
        ...payload,
        termId: payload.termId || 'cmqgjurlu002omm2zownjxfgk', // default or custom term ID
      }
      const res = await api.post('/follow-up/cases', body)
      const createdRaw = res.data?.data ?? res.data
      const disp = toDisplayCase(createdRaw)
      cases.value.unshift(disp)
      cacheData(cases.value)
      return disp
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create case')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCase(
    id: string,
    payload: {
      title?: string
      description?: string
      priority?: string
      status?: string
    },
  ) {
    loading.value = true
    error.value = null
    try {
      const res = await api.put(`/follow-up/cases/${id}`, payload)
      const updatedRaw = res.data?.data ?? res.data
      const disp = toDisplayCase(updatedRaw)
      const idx = cases.value.findIndex((c) => c.id === id)
      if (idx !== -1) {
        cases.value[idx] = disp
      }
      cacheData(cases.value)
      return disp
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update case')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteCase(id: string) {
    loading.value = true
    error.value = null
    try {
      await api.delete(`/follow-up/cases/${id}`)
      cases.value = cases.value.filter((c) => c.id !== id)
      cacheData(cases.value)
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to delete case')
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    cases,
    loading,
    error,
    fetched,
    fetchCases,
    createCase,
    updateCase,
    deleteCase,
  }
})
