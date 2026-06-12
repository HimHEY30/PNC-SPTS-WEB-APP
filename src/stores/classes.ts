import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/services/api'

export interface ApiClass {
  id: string
  name: string
  batchYear: number
  createdAt: string
  updatedAt: string
}

export interface DisplayClass {
  id: string
  name: string
  batchYear: number
}

const CLASSES_CACHE_KEY = 'classes_cache'

function loadCached(): DisplayClass[] {
  try {
    const raw = localStorage.getItem(CLASSES_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function cacheData(data: DisplayClass[]) {
  try {
    localStorage.setItem(CLASSES_CACHE_KEY, JSON.stringify(data))
  } catch {}
}

export const useClassesStore = defineStore('classes', () => {
  const classes = ref<DisplayClass[]>(loadCached())
  const loading = ref(false)
  const fetched = ref(false)

  const classMap = ref<Record<string, string>>({})

  function buildMap() {
    const map: Record<string, string> = {}
    for (const c of classes.value) {
      map[c.id] = c.name
    }
    classMap.value = map
  }

  buildMap()

  async function fetchClasses() {
    loading.value = true
    try {
      const response = await api.get('/classes')
      const raw: ApiClass[] = response.data?.data ?? response.data ?? []
      classes.value = raw.map((c) => ({
        id: c.id,
        name: c.name,
        batchYear: c.batchYear,
      }))
      cacheData(classes.value)
      buildMap()
      fetched.value = true
    } catch {
      if (classes.value.length === 0) {
        classes.value = loadCached()
        buildMap()
      }
    } finally {
      loading.value = false
    }
  }

  function getName(id: string | null): string {
    if (!id) return '—'
    return classMap.value[id] ?? '—'
  }

  return { classes, loading, fetched, fetchClasses, getName }
})
