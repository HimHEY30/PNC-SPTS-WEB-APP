<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconUsers,
  IconBriefcase,
  IconClock,
  IconCircleCheck,
  IconPlus,
  IconArrowRight,
  IconMessage,
  IconFileText,
  IconChevronLeft,
  IconChevronRight,
  IconCalendarEvent,
} from '@tabler/icons-vue'

// Stat Cards data matching SRS Page 2
const stats = ref([
  { label: 'Total Students', value: '1,284', icon: IconUsers, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
  { label: 'Students Under Follow-Up', value: '86', icon: IconBriefcase, color: 'bg-amber-50 text-amber-600', trend: '+4%' },
  { label: 'Open Cases', value: '24', icon: IconClock, color: 'bg-rose-50 text-rose-600', trend: '-2%' },
  { label: 'Resolved Cases', value: '112', icon: IconCircleCheck, color: 'bg-emerald-50 text-emerald-600', trend: '+18%' },
])

// Recent Activity Feed matching SRS Page 2 (Last 10 entries)
const recentActivity = ref([
  { id: 1, teacher: 'Ms. Chantrea Keo', student: 'Vannak Soy', date: '2 hours ago', subject: 'Grade improvement in Web Dev', type: 'Academic', priority: 'Low' },
  { id: 2, teacher: 'Mr. Dara Heng', student: 'Phanith Lim', date: '3 hours ago', subject: 'Inconsistent attendance in class', type: 'Attendance', priority: 'Medium' },
  { id: 3, teacher: 'Ms. Theary Sok', student: 'Sopheak Mom', date: '5 hours ago', subject: 'Exceptional performance in project', type: 'Achievement', priority: 'High' },
  { id: 4, teacher: 'Mr. Vuthy Long', student: 'Bona Chen', date: '1 day ago', subject: 'Behavioral issues in laboratory', type: 'Behaviour', priority: 'High' },
  { id: 5, teacher: 'Ms. Kanha Phan', student: 'Ratha Kim', date: '1 day ago', subject: 'Submission of late assignments', type: 'Academic', priority: 'Low' },
  { id: 6, teacher: 'Mr. Samnang Tep', student: 'Tola Heang', date: '2 days ago', subject: 'Student requested counseling', type: 'Pastoral Care', priority: 'Medium' },
  { id: 7, teacher: 'Mr. Rithy Chhum', student: 'Minea Vong', date: '2 days ago', subject: 'Cybersecurity project award', type: 'Achievement', priority: 'Critical' },
  { id: 8, teacher: 'Ms. Socheata Lim', student: 'Leakhena Meas', date: '3 days ago', subject: 'Low participation in group work', type: 'Academic', priority: 'Medium' },
  { id: 9, teacher: 'Ms. Chantrea Keo', student: 'Serey Phorn', date: '3 days ago', subject: 'Improved exam scores', type: 'Academic', priority: 'Low' },
  { id: 10, teacher: 'Mr. Dara Heng', student: 'Chantha Roeun', date: '4 days ago', subject: 'Attendance warning issued', type: 'Attendance', priority: 'High' },
])

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'High': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default: return 'bg-slate-100 text-slate-700'
  }
}

// Compact Card Calendar
const cardCalDate = ref(new Date())

const cardCalYear = computed(() => cardCalDate.value.getFullYear())
const cardCalMonth = computed(() => cardCalDate.value.getMonth())
const cardCalMonthName = computed(() =>
  cardCalDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const cardCalDays = computed(() => {
  const year = cardCalYear.value
  const month = cardCalMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: { num: number; isCurrent: boolean; isToday: boolean }[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push({ num: 0, isCurrent: false, isToday: false })
  }
  for (let d = 1; d <= totalDays; d++) {
    const isToday =
      d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
    cells.push({ num: d, isCurrent: true, isToday })
  }
  return cells
})

function cardCalPrev() {
  cardCalDate.value = new Date(cardCalYear.value, cardCalMonth.value - 1, 1)
}

function cardCalNext() {
  cardCalDate.value = new Date(cardCalYear.value, cardCalMonth.value + 1, 1)
}
</script>

<template>
  <div class="space-y-4 text-left">

    <!-- Quick Actions Row -->
    <div class="flex items-center justify-between">
      <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">Welcome back, Admin</h2>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#475569] font-semibold text-[10px] rounded-[5px] transition-colors shadow-sm">
          <IconPlus class="w-3.5 h-3.5" />
          Add Student
        </button>
        <button class="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b4b6b] hover:bg-[#2e3b54] text-white font-semibold text-[10px] rounded-[5px] transition-colors shadow-sm">
          <IconFileText class="w-3.5 h-3.5" />
          New Record
        </button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-[5px] border border-slate-100 p-3 shadow-sm space-y-2 hover:shadow transition-all cursor-default"
      >
        <div class="flex items-center justify-between">
          <div :class="['p-1.5 rounded-[5px]', stat.color]">
            <component :is="stat.icon" class="w-5 h-5" />
          </div>
          <span :class="['text-[10px] font-semibold px-1.5 py-0.5 rounded-full', stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50']">
            {{ stat.trend }}
          </span>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ stat.label }}</p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ stat.value }}</h3>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">

      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-[5px] border border-slate-100 shadow-sm flex flex-col">
        <div class="p-3 border-b border-slate-50 flex items-center justify-between">
          <h3 class="text-xs font-bold text-[#0f172a]">Recent Activity</h3>
          <button class="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
            View All <IconArrowRight class="w-3 h-3" />
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="activity in recentActivity" :key="activity.id" class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-3 py-2">
                  <p class="text-xs font-bold text-[#475569]">{{ activity.teacher }}</p>
                </td>
                <td class="px-3 py-2">
                  <p class="text-xs font-bold text-[#475569] group-hover:text-[#0f172a] cursor-pointer">{{ activity.student }}</p>
                </td>
                <td class="px-3 py-2">
                  <p class="text-xs font-bold text-[#475569] truncate max-w-[160px]">{{ activity.subject }}</p>
                  <p class="text-[10px] font-bold text-slate-400 mt-px">{{ activity.type }}</p>
                </td>
                <td class="px-3 py-2">
                  <span :class="['inline-flex items-center rounded-[3px] px-2 py-0.5 text-[10px] font-bold border', getPriorityClass(activity.priority)]">
                    {{ activity.priority }}
                  </span>
                </td>
                <td class="px-3 py-2 text-right">
                  <p class="text-[10px] font-bold text-slate-400">{{ activity.date }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-3">
        <!-- Compact Card Calendar -->
        <div class="bg-white rounded-[5px] border border-slate-100 shadow-sm select-none">
          <div class="flex items-center justify-between px-3 py-2 bg-[#1e1b4b] rounded-t-[5px]">
            <div class="flex items-center gap-1.5">
              <IconCalendarEvent class="w-3.5 h-3.5 text-white/70" />
              <span class="text-xs font-bold text-white">{{ cardCalMonthName }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button @click="cardCalPrev" class="p-1 rounded-[3px] text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <IconChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button @click="cardCalNext" class="p-1 rounded-[3px] text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                <IconChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div class="p-2">
            <div class="grid grid-cols-7 text-center text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              <span v-for="d in ['S', 'M', 'T', 'W', 'T', 'F', 'S']" :key="d" class="py-1">{{ d }}</span>
            </div>
            <div class="grid grid-cols-7 text-center">
              <div
                v-for="(cell, ci) in cardCalDays"
                :key="ci"
                class="py-1 text-[10px] font-bold"
                :class="cell.isCurrent
                  ? cell.isToday
                    ? 'bg-slate-900 text-white rounded-[3px]'
                    : 'text-slate-700'
                  : 'text-slate-200'"
              >
                {{ cell.num || '' }}
              </div>
            </div>
          </div>
        </div>

        <!-- PNC Portal -->
        <div class="bg-[#1e1b4b] rounded-[5px] p-4 text-white relative overflow-hidden group shadow-sm">
          <div class="relative z-10 space-y-2">
            <h3 class="text-xs font-bold leading-tight">Access the PNC Student Portal</h3>
            <p class="text-[10px] text-white/60">View announcements, calendars, and resources.</p>
            <button class="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-[10px] rounded-[5px] transition-all border border-white/10">
              Go to Portal <IconArrowRight class="w-3 h-3" />
            </button>
          </div>
          <IconFileText class="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
        </div>

        <!-- Support -->
        <div class="bg-white rounded-[5px] border border-slate-100 shadow-sm p-3 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
            <IconMessage class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs text-[#0f172a]">Need Technical Help?</p>
            <p class="text-[10px] text-slate-400">Contact the IT Support desk.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
