<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import {
  IconUsers,
  IconBriefcase,
  IconCircleCheck,
  IconClock,
  IconSearch,
  IconDownload,
  IconCalendar,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

const stats = ref([
  { label: 'Total Students', value: '1,284', icon: IconUsers, change: '+12%', color: 'bg-blue-50 text-blue-600' },
  { label: 'Active Follow-Ups', value: '86', icon: IconBriefcase, change: '+4%', color: 'bg-amber-50 text-amber-600' },
  { label: 'Resolved This Month', value: '34', icon: IconCircleCheck, change: '+18%', color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Avg Response Time', value: '2.4d', icon: IconClock, change: '-0.8d', color: 'bg-purple-50 text-purple-600' },
])

const caseTypeStats = ref([
  { type: 'Academic', count: 42, percentage: 35, color: 'bg-blue-500' },
  { type: 'Attendance', count: 28, percentage: 23, color: 'bg-amber-500' },
  { type: 'Behaviour', count: 18, percentage: 15, color: 'bg-rose-500' },
  { type: 'Achievement', count: 22, percentage: 18, color: 'bg-emerald-500' },
  { type: 'Pastoral Care', count: 11, percentage: 9, color: 'bg-purple-500' },
])

const monthlyData = ref([
  { month: 'Jan', cases: 18, resolved: 12 },
  { month: 'Feb', cases: 24, resolved: 18 },
  { month: 'Mar', cases: 31, resolved: 25 },
  { month: 'Apr', cases: 28, resolved: 22 },
  { month: 'May', cases: 35, resolved: 30 },
  { month: 'Jun', cases: 22, resolved: 16 },
])

const maxCases = computed(() => Math.max(...monthlyData.value.map(m => m.cases), 1))

const topTeachers = ref([
  { name: 'Ms. Chantrea Keo', cases: 15, resolved: 12, department: 'Web Development' },
  { name: 'Mr. Dara Heng', cases: 12, resolved: 10, department: 'Data Science' },
  { name: 'Ms. Theary Sok', cases: 11, resolved: 9, department: 'Mobile Dev' },
  { name: 'Mr. Samnang Tep', cases: 9, resolved: 7, department: 'Cyber Security' },
  { name: 'Ms. Kanha Phan', cases: 8, resolved: 6, department: 'DevOps' },
])

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedPeriod = ref('year')
const filteredTeachers = computed(() => {
  if (!searchQuery.value) return topTeachers.value
  const q = searchQuery.value.toLowerCase()
  return topTeachers.value.filter(t => t.name.toLowerCase().includes(q) || t.department.toLowerCase().includes(q))
})

const periodOptions: DropdownOption[] = [
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
]
</script>

<template>
  <div class="space-y-5 text-left">
    <div class="flex items-center justify-between">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Reports & Analytics</p>
      <div class="flex items-center gap-2">
        <BaseDropdown v-model="selectedPeriod" :options="periodOptions" :icon="IconCalendar" placeholder="Period" size="sm" />
        <button class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#475569] font-bold text-[10px] rounded-[5px] transition-colors shadow-sm">
          <IconDownload class="h-3.5 w-3.5" />
          Export
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-[5px] border border-slate-100 p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-default">
        <div class="flex items-center justify-between">
          <div :class="['p-1.5 rounded-[5px]', s.color]">
            <component :is="s.icon" class="w-5 h-5" />
          </div>
          <span :class="['text-[10px] font-semibold px-1.5 py-0.5 rounded-full', s.change.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50']">
            {{ s.change }}
          </span>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ s.label }}</p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ s.value }}</h3>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div class="bg-white rounded-[5px] border border-slate-100 shadow-md p-4">
        <h3 class="text-xs font-bold text-slate-700 mb-3">Cases by Type</h3>
        <div class="space-y-2.5">
          <div v-for="t in caseTypeStats" :key="t.type" class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-[#475569]">{{ t.type }}</span>
              <span class="font-bold text-slate-500">{{ t.count }} ({{ t.percentage }}%)</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-[3px] overflow-hidden">
              <div class="h-full rounded-[3px] transition-all" :class="t.color" :style="{ width: t.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[5px] border border-slate-100 shadow-md p-4">
        <h3 class="text-xs font-bold text-slate-700 mb-3">Monthly Trend</h3>
        <div class="flex items-end gap-2 h-36">
          <div v-for="m in monthlyData" :key="m.month" class="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span class="text-[9px] font-bold text-emerald-600">{{ m.resolved }}</span>
            <div class="w-full relative" :style="{ height: (m.cases / maxCases) * 100 + '%' }">
              <div class="absolute bottom-0 w-full rounded-[3px] bg-blue-200" :style="{ height: (m.cases / maxCases) * 100 + '%' }"></div>
              <div class="absolute bottom-0 w-full rounded-[3px] bg-emerald-500" :style="{ height: (m.resolved / maxCases) * 100 + '%' }"></div>
            </div>
            <span class="text-[9px] font-bold text-slate-400 mt-1">{{ m.month }}</span>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-3 pt-2 border-t border-slate-50">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-[3px] bg-blue-200"></span>
            <span class="text-[10px] font-bold text-slate-500">Opened</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-[3px] bg-emerald-500"></span>
            <span class="text-[10px] font-bold text-slate-500">Resolved</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[5px] border border-slate-100 shadow-md overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
        <h3 class="text-xs font-bold text-slate-700">Top Performing Teachers</h3>
        <div class="relative max-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
          />
          <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
            <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
            <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Cases</th>
            <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Resolved</th>
            <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Rate</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="t in filteredTeachers" :key="t.name" class="group hover:bg-slate-50/50 transition-colors">
            <td class="px-4 py-2.5">
              <div class="flex items-center gap-2.5">
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold select-none uppercase shadow-inner">
                  {{ t.name.charAt(0) }}{{ t.name.split(' ').slice(-1)[0]?.charAt(0) }}
                </div>
                <span class="text-xs font-bold text-[#475569] group-hover:text-[#0f172a] transition-colors">{{ t.name }}</span>
              </div>
            </td>
            <td class="px-4 py-2.5 text-xs font-bold text-slate-500">{{ t.department }}</td>
            <td class="px-4 py-2.5 text-center">
              <span class="text-xs font-bold text-[#475569]">{{ t.cases }}</span>
            </td>
            <td class="px-4 py-2.5 text-center">
              <span class="text-xs font-bold text-emerald-600">{{ t.resolved }}</span>
            </td>
            <td class="px-4 py-2.5 text-center">
              <span class="inline-flex items-center rounded-[3px] px-2 py-0.5 text-[10px] font-bold"
                :class="(t.resolved / t.cases) >= 0.8 ? 'bg-emerald-50 text-emerald-700' : (t.resolved / t.cases) >= 0.6 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'"
              >
                {{ Math.round((t.resolved / t.cases) * 100) }}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
