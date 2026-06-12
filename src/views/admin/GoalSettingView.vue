<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import {
  IconTarget,
  IconCheck,
  IconClock,
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconBook,
  IconFlag,
  IconSearch,
  IconCalendar,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

interface Goal {
  id: number
  student: string
  title: string
  category: string
  targetDate: string
  status: 'Not Started' | 'In Progress' | 'Achieved' | 'Cancelled'
  progress: number
  createdBy: string
  description: string
}

const goals = ref<Goal[]>([
  { id: 1, student: 'Vannak Soy', title: 'Improve JavaScript grade to B+', category: 'Academic', targetDate: '2026-08-15', status: 'In Progress', progress: 65, createdBy: 'Ms. Chantrea Keo', description: 'Focus on API integration and async programming concepts.' },
  { id: 2, student: 'Phanith Lim', title: 'Achieve 95% attendance this term', category: 'Attendance', targetDate: '2026-07-30', status: 'In Progress', progress: 40, createdBy: 'Mr. Dara Heng', description: 'Weekly check-ins to monitor attendance pattern.' },
  { id: 3, student: 'Sopheak Mom', title: 'Win inter-university hackathon', category: 'Achievement', targetDate: '2026-09-01', status: 'Not Started', progress: 0, createdBy: 'Ms. Theary Sok', description: 'Prepare for upcoming hackathon in September.' },
  { id: 4, student: 'Bona Chen', title: 'Complete 5 personal projects', category: 'Academic', targetDate: '2026-12-20', status: 'Not Started', progress: 0, createdBy: 'Mr. Vuthy Long', description: 'Build portfolio with real-world projects.' },
  { id: 5, student: 'Ratha Kim', title: 'Improve teamwork participation', category: 'Behaviour', targetDate: '2026-08-01', status: 'In Progress', progress: 50, createdBy: 'Ms. Kanha Phan', description: 'Engage actively in group projects and discussions.' },
  { id: 6, student: 'Tola Heang', title: 'Achieve Python certification', category: 'Academic', targetDate: '2026-10-15', status: 'In Progress', progress: 75, createdBy: 'Mr. Samnang Tep', description: 'Study for PCAP certification exam.' },
  { id: 7, student: 'Minea Vong', title: 'Secure cybersecurity internship', category: 'Career', targetDate: '2026-11-01', status: 'Not Started', progress: 15, createdBy: 'Mr. Rithy Chhum', description: 'Prepare resume and apply for internships.' },
  { id: 8, student: 'Leakhena Meas', title: 'Improve public speaking skills', category: 'Personal', targetDate: '2026-09-30', status: 'Achieved', progress: 100, createdBy: 'Ms. Socheata Lim', description: 'Successfully presented at student seminar.' },
])

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedCategory = ref('')
const selectedStatus = ref('')

const uniqueCategories = computed(() => [...new Set(goals.value.map(g => g.category))])

const categoryOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Categories' },
  ...uniqueCategories.value.map(c => ({ value: c, label: c })),
])

const statusOptions: DropdownOption[] = [
  { value: '', label: 'All Status' },
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Achieved', label: 'Achieved' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const filteredGoals = computed(() => {
  let result = goals.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(g => g.student.toLowerCase().includes(q) || g.title.toLowerCase().includes(q) || g.createdBy.toLowerCase().includes(q))
  }
  if (selectedCategory.value) result = result.filter(g => g.category === selectedCategory.value)
  if (selectedStatus.value) result = result.filter(g => g.status === selectedStatus.value)
  return result
})

const statusClass = (s: string) => {
  switch (s) {
    case 'Achieved': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'Not Started': return 'bg-slate-100 text-slate-500 border-slate-200'
    case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100'
    default: return 'bg-slate-100 text-slate-600'
  }
}

const progressColor = (p: number) => {
  if (p >= 100) return 'bg-emerald-500'
  if (p >= 60) return 'bg-blue-500'
  if (p >= 30) return 'bg-amber-500'
  return 'bg-slate-300'
}

const overviewStats = computed(() => ({
  total: goals.value.length,
  achieved: goals.value.filter(g => g.status === 'Achieved').length,
  inProgress: goals.value.filter(g => g.status === 'In Progress').length,
  notStarted: goals.value.filter(g => g.status === 'Not Started').length,
}))
</script>

<template>
  <div class="space-y-5 text-left">
    <div class="flex items-center justify-between">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{{ goals.length }} goals total</p>
      <button class="inline-flex items-center gap-2 rounded-[5px] bg-[#3b4b6b] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e3b54] transition-colors shadow-sm">
        <IconPlus class="h-4 w-4" />
        New Goal
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="bg-white rounded-[5px] border border-slate-100 p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-default">
        <div class="flex items-center justify-between">
          <div class="p-1.5 rounded-[5px] bg-slate-100 text-slate-600">
            <IconTarget class="w-5 h-5" />
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Goals</p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ overviewStats.total }}</h3>
        </div>
      </div>
      <div class="bg-white rounded-[5px] border border-slate-100 p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-default">
        <div class="flex items-center justify-between">
          <div class="p-1.5 rounded-[5px] bg-emerald-50 text-emerald-600">
            <IconCheck class="w-5 h-5" />
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Achieved</p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ overviewStats.achieved }}</h3>
        </div>
      </div>
      <div class="bg-white rounded-[5px] border border-slate-100 p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-default">
        <div class="flex items-center justify-between">
          <div class="p-1.5 rounded-[5px] bg-blue-50 text-blue-600">
            <IconClock class="w-5 h-5" />
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ overviewStats.inProgress }}</h3>
        </div>
      </div>
      <div class="bg-white rounded-[5px] border border-slate-100 p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-default">
        <div class="flex items-center justify-between">
          <div class="p-1.5 rounded-[5px] bg-slate-100 text-slate-400">
            <IconClock class="w-5 h-5" />
          </div>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Not Started</p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ overviewStats.notStarted }}</h3>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[280px] max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by student, goal, or creator..."
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
      <BaseDropdown v-model="selectedCategory" :options="categoryOptions" :icon="IconBook" placeholder="All Categories" />
      <BaseDropdown v-model="selectedStatus" :options="statusOptions" :icon="IconFlag" placeholder="All Status" />
    </div>

    <div class="overflow-hidden rounded-[5px] bg-white border border-slate-100 shadow-md">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Progress</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="g in filteredGoals" :key="g.id" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-4 py-2.5">
                <div class="min-w-0 max-w-[200px]">
                  <p class="font-bold text-xs text-[#0f172a] truncate">{{ g.title }}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5 truncate">{{ g.description }}</p>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-1.5">
                  <IconUser class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span class="text-xs font-bold text-[#475569]">{{ g.student }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <span class="inline-flex items-center rounded-[3px] bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-bold border border-purple-100">
                  {{ g.category }}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2 min-w-[100px]">
                  <div class="flex-1 h-1.5 bg-slate-100 rounded-[3px] overflow-hidden">
                    <div class="h-full rounded-[3px] transition-all" :class="progressColor(g.progress)" :style="{ width: g.progress + '%' }"></div>
                  </div>
                  <span class="text-[10px] font-bold text-slate-500 w-8 text-right">{{ g.progress }}%</span>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <span class="inline-flex items-center rounded-[3px] px-2 py-0.5 text-[10px] font-bold border" :class="statusClass(g.status)">
                  {{ g.status }}
                </span>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-1.5">
                  <IconCalendar class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span class="text-xs font-bold text-slate-500">{{ g.targetDate }}</span>
                </div>
              </td>
              <td class="px-4 py-2.5 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm" title="Edit">
                    <IconEdit class="h-4 w-4" />
                  </button>
                  <button class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all shadow-sm" title="Delete">
                    <IconTrash class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="filteredGoals.length === 0" class="flex flex-col items-center justify-center py-16">
      <IconTarget class="h-10 w-10 text-slate-300" />
      <p class="mt-2 text-xs font-bold text-slate-500">No goals found</p>
      <p class="text-[10px] text-slate-400 mt-0.5">Try adjusting your search or filters</p>
    </div>
  </div>
</template>
