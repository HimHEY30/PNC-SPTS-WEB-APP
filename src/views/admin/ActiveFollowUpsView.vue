<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconBook,
  IconFlag,
  IconClock,
  IconMessages,
  IconAlertCircle,
  IconCircleCheck,
  IconLoader2,
  IconArrowsSort,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

interface ActiveCase {
  id: number
  student: string
  teacher: string
  type: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: string
  subject: string
  openedDate: string
  lastUpdate: string
  description: string
}

const cases = ref<ActiveCase[]>([
  { id: 1, student: 'Vannak Soy', teacher: 'Ms. Chantrea Keo', type: 'Academic', priority: 'Low', status: 'In Progress', subject: 'Grade improvement in Web Dev', openedDate: '2026-06-01', lastUpdate: '2 hours ago', description: 'Student showing steady improvement in JavaScript fundamentals. Needs additional practice with APIs.' },
  { id: 2, student: 'Phanith Lim', teacher: 'Mr. Dara Heng', type: 'Attendance', priority: 'Medium', status: 'Open', subject: 'Inconsistent attendance', openedDate: '2026-06-05', lastUpdate: '3 hours ago', description: 'Has missed 4 classes this month. Meeting scheduled with parents.' },
  { id: 3, student: 'Sopheak Mom', teacher: 'Ms. Theary Sok', type: 'Achievement', priority: 'High', status: 'In Progress', subject: 'Exceptional project performance', openedDate: '2026-06-03', lastUpdate: '5 hours ago', description: 'Student excelled in mobile app project. Considering for advanced track.' },
  { id: 4, student: 'Bona Chen', teacher: 'Mr. Vuthy Long', type: 'Behaviour', priority: 'High', status: 'Open', subject: 'Lab behavioral issues', openedDate: '2026-06-07', lastUpdate: '1 day ago', description: 'Disruptive behavior during lab sessions. Counselor referral initiated.' },
  { id: 5, student: 'Ratha Kim', teacher: 'Ms. Kanha Phan', type: 'Academic', priority: 'Low', status: 'Resolved', subject: 'Late assignments', openedDate: '2026-05-20', lastUpdate: '1 day ago', description: 'Student has caught up on all pending assignments. Case closed.' },
  { id: 6, student: 'Tola Heang', teacher: 'Mr. Samnang Tep', type: 'Pastoral Care', priority: 'Medium', status: 'In Progress', subject: 'Counseling request', openedDate: '2026-06-02', lastUpdate: '2 days ago', description: 'Student requested personal counseling. Sessions ongoing.' },
  { id: 7, student: 'Minea Vong', teacher: 'Mr. Rithy Chhum', type: 'Achievement', priority: 'Critical', status: 'In Progress', subject: 'Cybersecurity award', openedDate: '2026-06-08', lastUpdate: '2 days ago', description: 'Student won inter-university CTF competition. Nominating for scholarship.' },
  { id: 8, student: 'Leakhena Meas', teacher: 'Ms. Socheata Lim', type: 'Academic', priority: 'Medium', status: 'Open', subject: 'Low group participation', openedDate: '2026-06-06', lastUpdate: '3 days ago', description: 'Reluctant to participate in group activities. Developing engagement plan.' },
])

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedType = ref('')
const selectedPriority = ref('')
const selectedStatus = ref('')
const selectedSort = ref('priority')

const uniqueTypes = computed(() => [...new Set(cases.value.map(c => c.type))])
const uniqueStatuses = computed(() => [...new Set(cases.value.map(c => c.status))])

const typeOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Types' },
  ...uniqueTypes.value.map(t => ({ value: t, label: t })),
])

const priorityOptions: DropdownOption[] = [
  { value: '', label: 'All Priority' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

const statusOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Status' },
  ...uniqueStatuses.value.map(s => ({ value: s, label: s })),
])

const sortOptions: DropdownOption[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'date', label: 'Date' },
  { value: 'student', label: 'Student' },
]

const filteredCases = computed(() => {
  let result = cases.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c => c.student.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q) || c.teacher.toLowerCase().includes(q))
  }
  if (selectedType.value) result = result.filter(c => c.type === selectedType.value)
  if (selectedPriority.value) result = result.filter(c => c.priority === selectedPriority.value)
  if (selectedStatus.value) result = result.filter(c => c.status === selectedStatus.value)
  return [...result].sort((a, b) => {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
    switch (selectedSort.value) {
      case 'priority': return (order[a.priority] ?? 4) - (order[b.priority] ?? 4)
      case 'date': return new Date(b.openedDate).getTime() - new Date(a.openedDate).getTime()
      case 'student': return a.student.localeCompare(b.student)
      default: return 0
    }
  })
})

const priorityClass = (p: string) => {
  switch (p) {
    case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default: return 'bg-slate-100 text-slate-600'
  }
}

const statusIcon = (s: string) => {
  switch (s) {
    case 'Open': return IconAlertCircle
    case 'In Progress': return IconLoader2
    case 'Resolved': return IconCircleCheck
    default: return IconClock
  }
}

const statusClass = (s: string) => {
  switch (s) {
    case 'Open': return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'Resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default: return 'bg-slate-100 text-slate-600'
  }
}
</script>

<template>
  <div class="space-y-5 text-left">
    <div class="flex items-center justify-between">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{{ cases.length }} active cases</p>
      <button class="inline-flex items-center gap-2 rounded-[5px] bg-[#3b4b6b] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e3b54] transition-colors shadow-sm">
        <IconPlus class="h-4 w-4" />
        New Case
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[280px] max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by student, teacher, or subject..."
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
      <BaseDropdown v-model="selectedType" :options="typeOptions" :icon="IconBook" placeholder="All Types" />
      <BaseDropdown v-model="selectedPriority" :options="priorityOptions" :icon="IconFlag" placeholder="All Priority" />
      <BaseDropdown v-model="selectedStatus" :options="statusOptions" :icon="IconFilter" placeholder="All Status" />
      <BaseDropdown v-model="selectedSort" :options="sortOptions" :icon="IconArrowsSort" placeholder="Sort" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="c in filteredCases"
        :key="c.id"
        class="bg-white rounded-[5px] border border-slate-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
      >
        <div class="px-4 py-3 space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold select-none uppercase shadow-inner">
                {{ c.student.charAt(0) }}
              </div>
              <div class="min-w-0">
                <p class="font-bold text-xs text-[#0f172a] truncate">{{ c.student }}</p>
                <p class="text-[10px] font-bold text-slate-400 truncate">{{ c.teacher }}</p>
              </div>
            </div>
            <span
              class="shrink-0 inline-flex items-center rounded-[3px] px-2 py-0.5 text-[10px] font-bold border"
              :class="priorityClass(c.priority)"
            >
              {{ c.priority }}
            </span>
          </div>

          <div>
            <p class="text-xs font-bold text-[#475569] leading-snug">{{ c.subject }}</p>
            <p class="text-[10px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{{ c.description }}</p>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-slate-50">
            <div class="flex items-center gap-2">
              <span
                class="inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-bold border"
                :class="statusClass(c.status)"
              >
                <component :is="statusIcon(c.status)" class="h-3 w-3" :class="c.status === 'In Progress' ? 'animate-spin' : ''" />
                {{ c.status }}
              </span>
              <span class="inline-flex items-center gap-1 rounded-[3px] bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-bold border border-purple-100">
                <IconBook class="h-3 w-3" />
                {{ c.type }}
              </span>
            </div>
            <span class="text-[10px] font-bold text-slate-400 shrink-0">{{ c.lastUpdate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredCases.length === 0" class="flex flex-col items-center justify-center py-16">
      <IconMessages class="h-10 w-10 text-slate-300" />
      <p class="mt-2 text-xs font-bold text-slate-500">No active cases found</p>
      <p class="text-[10px] text-slate-400 mt-0.5">Try adjusting your search or filters</p>
    </div>
  </div>
</template>
