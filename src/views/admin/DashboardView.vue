<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  IconUsers,
  IconBriefcase,
  IconClock,
  IconCircleCheck,
  IconPlus,
  IconArrowRight,
  IconMessage,
  IconFileText,
  IconCalendarEvent,
} from '@tabler/icons-vue'
import { useStudentsStore } from '@/stores/students'
import { useAuthStore } from '@/stores/auth'

const studentsStore = useStudentsStore()
const authStore = useAuthStore()
const studentsLoading = ref(false)

const canAddStudent = computed(() => {
  const roles = authStore.user?.roles || []
  return roles.includes('SUPER_ADMIN') || roles.includes('ADMIN')
})

onMounted(async () => {
  if (!studentsStore.fetched) {
    studentsLoading.value = true
    await studentsStore.fetchStudents()
    studentsLoading.value = false
  }
  
  // Timer for real-time clock
  timer = window.setInterval(() => {
    cardCalDate.value = new Date()
  }, 1000)
})

let timer: number | undefined

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const totalStudents = computed(() => {
  return studentsStore.students.length.toLocaleString()
})

const isTutor = computed(() => {
  const roles = authStore.user?.roles || []
  return roles.includes('TUTOR')
})

// Dynamic stats cards matching SRS requirements while adapting to the logged-in role
const stats = computed(() => {
  if (isTutor.value) {
    return [
      {
        label: 'Assigned Students',
        value: studentsLoading.value ? '...' : totalStudents.value,
        icon: IconUsers,
        color: 'bg-blue-50 text-blue-600',
        trend: 'Active',
      },
      {
        label: 'Pending Evaluations',
        value: studentsLoading.value
          ? '...'
          : String(Math.ceil(studentsStore.students.length * 0.3)),
        icon: IconClock,
        color: 'bg-amber-50 text-amber-600',
        trend: 'This Term',
      },
      {
        label: 'Submitted Evaluations',
        value: studentsLoading.value
          ? '...'
          : String(Math.floor(studentsStore.students.length * 0.7)),
        icon: IconCircleCheck,
        color: 'bg-emerald-50 text-emerald-600',
        trend: 'Approved',
      },
      {
        label: 'Class Average Grade',
        value: '84.5%',
        icon: IconBriefcase,
        color: 'bg-indigo-50 text-indigo-600',
        trend: '+2.1%',
      },
    ]
  } else {
    return [
      {
        label: 'Total Students',
        value: studentsLoading.value ? '...' : totalStudents.value,
        icon: IconUsers,
        color: 'bg-blue-50 text-blue-600',
        trend: '+12%',
      },
      {
        label: 'Students Under Follow-Up',
        value: '86',
        icon: IconBriefcase,
        color: 'bg-amber-50 text-amber-600',
        trend: '+4%',
      },
      {
        label: 'Open Cases',
        value: '24',
        icon: IconClock,
        color: 'bg-rose-50 text-rose-600',
        trend: '-2%',
      },
      {
        label: 'Resolved Cases',
        value: '112',
        icon: IconCircleCheck,
        color: 'bg-emerald-50 text-emerald-600',
        trend: '+18%',
      },
    ]
  }
})

// Recent Activity Feed matching SRS Page 2 (Last 10 entries)
const recentActivity = ref([
  {
    id: 1,
    teacher: 'Ms. Chantrea Keo',
    student: 'Vannak Soy',
    date: '2 hours ago',
    subject: 'Grade improvement in Web Dev',
    type: 'Academic',
    priority: 'Low',
  },
  {
    id: 2,
    teacher: 'Mr. Dara Heng',
    student: 'Phanith Lim',
    date: '3 hours ago',
    subject: 'Inconsistent attendance in class',
    type: 'Attendance',
    priority: 'Medium',
  },
  {
    id: 3,
    teacher: 'Ms. Theary Sok',
    student: 'Sopheak Mom',
    date: '5 hours ago',
    subject: 'Exceptional performance in project',
    type: 'Achievement',
    priority: 'High',
  },
  {
    id: 4,
    teacher: 'Mr. Vuthy Long',
    student: 'Bona Chen',
    date: '1 day ago',
    subject: 'Behavioral issues in laboratory',
    type: 'Behaviour',
    priority: 'High',
  },
  {
    id: 5,
    teacher: 'Ms. Kanha Phan',
    student: 'Ratha Kim',
    date: '1 day ago',
    subject: 'Submission of late assignments',
    type: 'Academic',
    priority: 'Low',
  },
  {
    id: 6,
    teacher: 'Mr. Samnang Tep',
    student: 'Tola Heang',
    date: '2 days ago',
    subject: 'Student requested counseling',
    type: 'Pastoral Care',
    priority: 'Medium',
  },
  {
    id: 7,
    teacher: 'Mr. Rithy Chhum',
    student: 'Minea Vong',
    date: '2 days ago',
    subject: 'Cybersecurity project award',
    type: 'Achievement',
    priority: 'Critical',
  },
  {
    id: 8,
    teacher: 'Ms. Socheata Lim',
    student: 'Leakhena Meas',
    date: '3 days ago',
    subject: 'Low participation in group work',
    type: 'Academic',
    priority: 'Medium',
  },
  {
    id: 9,
    teacher: 'Ms. Chantrea Keo',
    student: 'Serey Phorn',
    date: '3 days ago',
    subject: 'Improved exam scores',
    type: 'Academic',
    priority: 'Low',
  },
  {
    id: 10,
    teacher: 'Mr. Dara Heng',
    student: 'Chantha Roeun',
    date: '4 days ago',
    subject: 'Attendance warning issued',
    type: 'Attendance',
    priority: 'High',
  },
])

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-100 text-rose-700 border-rose-200'
    case 'High':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Medium':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Low':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

// Profile Date Card variables
const cardCalDate = ref(new Date())

const currentDay = computed(() => cardCalDate.value.getDate())
const currentMonthText = computed(() => cardCalDate.value.toLocaleDateString('en-US', { month: 'short' }))
const currentYearNum = computed(() => cardCalDate.value.getFullYear())
const currentTimeText = computed(() => cardCalDate.value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))

const userInitials = computed(() => {
  const name = authStore.user?.name || 'User'
  return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
})
</script>

<template>
  <div class="space-y-4 text-left">
    <!-- Quick Actions Row -->
    <div class="flex items-center justify-between">
      <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
        Welcome back, {{ authStore.user?.name || 'User' }}
      </h2>
      <div class="flex items-center gap-2">
        <button
          v-if="canAddStudent"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#475569] font-semibold text-[10px] rounded-[5px] transition-colors shadow-sm"
        >
          <IconPlus class="w-3.5 h-3.5" />
          Add Student
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b4b6b] hover:bg-[#2e3b54] text-white font-semibold text-[10px] rounded-[5px] transition-colors shadow-sm"
        >
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
          <span
            :class="[
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              stat.trend.startsWith('+')
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-rose-600 bg-rose-50',
            ]"
          >
            {{ stat.trend }}
          </span>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {{ stat.label }}
          </p>
          <h3 class="text-base font-bold text-[#0f172a] mt-0.5">{{ stat.value }}</h3>
        </div>
      </div>
    </div>

    <!-- Main Dashboard Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <!-- Recent Activity -->
      <div
        class="lg:col-span-3 bg-white rounded-[5px] border border-slate-100 shadow-sm flex flex-col"
      >
        <div class="p-3 border-b border-slate-50 flex items-center justify-between">
          <h3 class="text-xs font-bold text-[#0f172a]">Recent Activity</h3>
          <button
            class="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            View All <IconArrowRight class="w-3 h-3" />
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50">
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Teacher
                </th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Student
                </th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Subject
                </th>
                <th class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Priority
                </th>
                <th
                  class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right"
                >
                  Date
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="activity in recentActivity"
                :key="activity.id"
                class="hover:bg-slate-50/50 transition-colors group"
              >
                <td class="px-3 py-2">
                  <p class="text-xs font-bold text-[#475569]">{{ activity.teacher }}</p>
                </td>
                <td class="px-3 py-2">
                  <p
                    class="text-xs font-bold text-[#475569] group-hover:text-[#0f172a] cursor-pointer"
                  >
                    {{ activity.student }}
                  </p>
                </td>
                <td class="px-3 py-2">
                  <p class="text-xs font-bold text-[#475569] truncate max-w-[160px]">
                    {{ activity.subject }}
                  </p>
                  <p class="text-[10px] font-bold text-slate-400 mt-px">{{ activity.type }}</p>
                </td>
                <td class="px-3 py-2">
                  <span
                    :class="[
                      'inline-flex items-center rounded-[3px] px-2 py-0.5 text-[10px] font-bold border',
                      getPriorityClass(activity.priority),
                    ]"
                  >
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
        <!-- Profile Date Card (Replaces Compact Calendar) -->
        <div class="bg-white rounded-[16px] border border-slate-100 shadow-sm select-none p-3">
          <!-- Green Gradient Banner -->
          <div class="h-16 bg-card rounded-[10px]"></div>
          
          <!-- Overlapping Avatar -->
          <div class="relative -mt-8 ml-3 flex justify-start">
            <div class="w-12 h-12 rounded-full border-[3px] border-white shadow bg-white overflow-hidden flex items-center justify-center shrink-0">
              <img
                v-if="authStore.user?.profile_image"
                :src="authStore.user.profile_image"
                class="w-full h-full object-cover"
                alt="User avatar"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
              <div v-else class="w-full h-full bg-[#3b4b6b] text-white font-bold flex items-center justify-center text-[10px] uppercase">
                {{ userInitials }}
              </div>
            </div>
          </div>
          
          <!-- Name and Buttons -->
          <div class="mt-2 px-1 flex items-start justify-between">
            <div class="min-w-0 pr-2">
              <h3 class="text-xs font-bold text-slate-800 truncate leading-none">
                {{ authStore.user?.name || 'User' }}
              </h3>
              <p class="text-[9px] text-slate-400 font-semibold mt-0.5 block truncate">
                @{{ authStore.user?.email ? authStore.user.email.split('@')[0] : 'user' }}
              </p>
            </div>
            
            <button class="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-3 py-1 text-[9px] font-bold transition-all shadow-sm cursor-pointer">
              Profile
            </button>
          </div>
          
          <hr class="border-slate-100 my-2" />
          
          <!-- Stats: Day, Month, Year, Time -->
          <div class="flex items-center justify-between px-2 pb-3 w-full">
            <div class="flex flex-col items-start">
              <span class="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                <IconCalendarEvent class="w-3 h-3 text-slate-500" />
                {{ currentDay }}
              </span>
              <span class="text-[8px] text-slate-400 font-semibold mt-0.5 ml-4">Day</span>
            </div>
            <div class="flex flex-col items-start">
              <span class="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                <IconFileText class="w-3 h-3 text-slate-500" />
                {{ currentMonthText }}
              </span>
              <span class="text-[8px] text-slate-400 font-semibold mt-0.5 ml-4">Month</span>
            </div>
            <div class="flex flex-col items-start">
              <span class="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                <IconCalendarEvent class="w-3 h-3 text-slate-500" />
                {{ currentYearNum }}
              </span>
              <span class="text-[8px] text-slate-400 font-semibold mt-0.5 ml-4">Year</span>
            </div>
            <div class="flex flex-col items-start">
              <span class="flex items-center gap-1 text-[11px] font-bold text-slate-800">
                <IconClock class="w-3 h-3 text-slate-500" />
                {{ currentTimeText }}
              </span>
              <span class="text-[8px] text-slate-400 font-semibold mt-0.5 ml-4">Time</span>
            </div>
          </div>
          
          <!-- Bottom Action Button -->
          <div>
            <button class="w-full bg-gradient-to-r from-black to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-full py-1.5 px-2 text-[9px] font-bold transition-all shadow-md flex items-center justify-between">
               <div class="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0">
                 <IconArrowRight class="w-2.5 h-2.5 text-black" />
               </div>
               <span class="absolute left-1/2 -translate-x-1/2">View Schedule</span>
            </button>
          </div>
        </div>

        <!-- PNC Portal -->
        <div
          class="bg-[#1e1b4b] rounded-[5px] p-4 text-white relative overflow-hidden group shadow-sm"
        >
          <div class="relative z-10 space-y-2">
            <h3 class="text-xs font-bold leading-tight">Access the PNC Student Portal</h3>
            <p class="text-[10px] text-white/60">View announcements, calendars, and resources.</p>
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-[10px] rounded-[5px] transition-all border border-white/10"
            >
              Go to Portal <IconArrowRight class="w-3 h-3" />
            </button>
          </div>
          <IconFileText
            class="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500"
          />
        </div>

        <!-- Support -->
        <div
          class="bg-white rounded-[5px] border border-slate-100 shadow-sm p-3 flex items-center gap-3"
        >
          <div
            class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0"
          >
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
