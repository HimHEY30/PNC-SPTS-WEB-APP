<script setup lang="ts">
import { ref, computed } from 'vue'
import { IconPlus, IconEdit, IconFileText, IconCalendar } from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

// Follow-up data matching SRS FR-007
const followUps = ref([
  {
    id: 1,
    teacher: { name: 'Ms. Chantrea Keo', avatar: '' },
    student: 'Vannak Soy',
    date: 'Jun 15, 2026',
    type: 'Academic',
    priority: 'Low',
    status: 'Resolved',
    subject: 'Grade improvement in Web Dev',
    comment:
      '<p>Student has shown significant improvement in recent <strong>JavaScript</strong> assignments. Participation has also increased.</p>',
    attachments: [{ name: 'results_final.pdf', size: '1.2 MB' }],
  },
  {
    id: 2,
    teacher: { name: 'Mr. Dara Heng', avatar: '' },
    student: 'Phanith Lim',
    date: 'Jun 14, 2026',
    type: 'Attendance',
    priority: 'Medium',
    status: 'In-Progress',
    subject: 'Inconsistent attendance in class',
    comment:
      '<p>Phanith has missed 3 sessions this week without prior notification. Need to contact parents for clarification.</p>',
    attachments: [] as { name: string; size: string }[],
  },
  {
    id: 3,
    teacher: { name: 'Ms. Theary Sok', avatar: '' },
    student: 'Sopheak Mom',
    date: 'Jun 12, 2026',
    type: 'Achievement',
    priority: 'High',
    status: 'Closed',
    subject: 'Exceptional performance in project',
    comment:
      '<p>Awarded "Student of the Month" for outstanding contribution to the <strong>Environmental Awareness</strong> campaign.</p>',
    attachments: [{ name: 'certificate.jpg', size: '2.4 MB' }],
  },
  {
    id: 4,
    teacher: { name: 'Mr. Vuthy Long', avatar: '' },
    student: 'Bona Chen',
    date: 'Jun 10, 2026',
    type: 'Behaviour',
    priority: 'Critical',
    status: 'Open',
    subject: 'Behavioral issues in laboratory',
    comment:
      '<p>Disruptive conduct reported during the Chemistry lab session. Safety protocols were violated. Immediate intervention required.</p>',
    attachments: [{ name: 'incident_report.pdf', size: '0.8 MB' }],
  },
])

const filterType = ref('')
const filterPriority = ref('')
const filterStatus = ref('')
const sortOrder = ref('Newest First')

const clearFilters = () => {
  filterType.value = ''
  filterPriority.value = ''
  filterStatus.value = ''
}


const typeOptions: DropdownOption[] = [
  { value: '', label: 'All Types' },
  { value: 'Academic', label: 'Academic' },
  { value: 'Behaviour', label: 'Behaviour' },
  { value: 'Achievement', label: 'Achievement' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'Pastoral Care', label: 'Pastoral Care' },
]

const priorityOptions: DropdownOption[] = [
  { value: '', label: 'All Priorities' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

const statusOptions: DropdownOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'In-Progress', label: 'In-Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
]

const sortOptions: DropdownOption[] = [
  { value: 'Newest First', label: 'Newest First' },
  { value: 'Oldest First', label: 'Oldest First' },
]

const filteredFollowUps = computed(() => {
  const result = followUps.value.filter((item) => {
    return (
      (!filterType.value || item.type === filterType.value) &&
      (!filterPriority.value || item.priority === filterPriority.value) &&
      (!filterStatus.value || item.status === filterStatus.value)
    )
  })

  if (sortOrder.value === 'Oldest First') {
    return result.slice().reverse()
  }
  return result
})

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'High':
      return 'bg-orange-50 text-orange-600 border-orange-100'
    case 'Medium':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'Low':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-indigo-50 text-indigo-600 border-indigo-100'
    case 'In-Progress':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'Closed':
      return 'bg-slate-100 text-slate-500 border-slate-200'
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}
</script>

<template>
  <div class="space-y-6 text-left max-w-[1000px] mx-auto pb-10">
    <!-- Header Section -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-base font-bold text-[#0f172a]">Follow-Up Timeline</h1>
        <p class="text-xs font-bold text-slate-400 mt-1">
          Complete chronological history of student monitoring activities across the institution.
        </p>
      </div>
      <button
        class="flex items-center gap-2 px-4 py-2 bg-[#3b4b6b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
      >
        <IconPlus class="w-4 h-4" />
        New Record
      </button>
    </div>

    <!-- Filter Bar (SRS Page 6) -->
    <div
      class="bg-white rounded-[5px] border border-slate-100 p-4 shadow-md flex flex-wrap items-center justify-between gap-4"
    >
      <div class="flex flex-wrap items-center gap-3">
        <BaseDropdown v-model="filterType" :options="typeOptions" placeholder="All Types" />
        <BaseDropdown
          v-model="filterPriority"
          :options="priorityOptions"
          placeholder="All Priorities"
        />
        <BaseDropdown v-model="filterStatus" :options="statusOptions" placeholder="All Statuses" />

        <button
          v-if="filterType || filterPriority || filterStatus"
          @click="clearFilters"
          class="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div class="flex items-center gap-3">
        <BaseDropdown v-model="sortOrder" :options="sortOptions" placeholder="Sort" />
      </div>
    </div>

    <!-- Timeline Cards (SRS Page 6) -->
    <div
      class="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent"
    >
      <div
        v-for="item in filteredFollowUps"
        :key="item.id"
        class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
      >
        <!-- Dot indicator -->
        <div
          class="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
        >
          <IconCalendar class="w-5 h-5" />
        </div>

        <!-- Card content -->
        <div
          class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-[5px] border border-slate-100 shadow-md group-hover:shadow-lg transition-all"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500"
              >
                {{
                  item.teacher.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                }}
              </div>
              <div>
                <p class="text-xs font-bold text-[#475569]">{{ item.teacher.name }}</p>
                <p class="text-[10px] font-bold text-slate-400">{{ item.date }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button
                class="p-1.5 rounded-[5px] text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <IconEdit class="w-4 h-4" />
              </button>
              <button
                class="p-1.5 rounded-[5px] text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="w-4 h-4"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M4 7l16 0" />
                  <path d="M10 11l0 6" />
                  <path d="M14 11l0 6" />
                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                </svg>
              </button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold text-[#475569] mr-1">For {{ item.student }}</span>
              <span
                :class="[
                  'px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider border',
                  getPriorityClass(item.priority),
                ]"
              >
                {{ item.priority }} Priority
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider border',
                  getStatusClass(item.status),
                ]"
              >
                {{ item.status }}
              </span>
              <span
                class="px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100"
              >
                {{ item.type }}
              </span>
            </div>

            <h4 class="text-xs font-bold text-[#0f172a]">{{ item.subject }}</h4>

            <!-- Rendered Rich Text Comment -->
            <div
              class="text-xs text-slate-600 leading-relaxed font-medium prose prose-sm max-w-none"
              v-html="item.comment"
            ></div>

            <!-- Attachments Panel -->
            <div v-if="item.attachments.length > 0" class="pt-2 flex flex-wrap gap-2">
              <div
                v-for="file in item.attachments"
                :key="file.name"
                class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-[5px] group/file cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <IconFileText class="w-3.5 h-3.5 text-slate-400 group-hover/file:text-indigo-500" />
                <span class="text-[10px] font-bold text-[#475569]">{{ file.name }}</span>
                <span class="text-[9px] font-bold text-slate-400">({{ file.size }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pt-8 flex justify-center">
      <button
        class="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-[5px] transition-all shadow-sm"
      >
        Load More Records
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Timeline line adjustment for better visual centering */
@media (min-width: 768px) {
  .md\:group-odd\:-translate-x-1\/2 {
    transform: translateX(-50%);
  }
  .md\:group-even\:translate-x-1\/2 {
    transform: translateX(50%);
  }
}
</style>
