<script setup lang="ts">
import { ref, computed, inject, type Ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useToastStore } from '@/stores/toast'
import {
  IconSearch,
  IconMail,
  IconPhone,
  IconMapPin,
  IconAward,
  IconDots,
  IconFileText,
  IconMessage,
  IconEdit,
  IconX,
  IconUser,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

const route = useRoute()
const store = useStudentsStore()
const toast = useToastStore()

const studentId = computed(() => route.params.id as string)

// Student details state (editable)
const student = ref({
  id: '1',
  name: 'Lethean Seourn',
  email: 'lethean.seourn@student.passerellesnumeriques.org',
  phone: '+855092333064',
  address: 'Kampong Cham',
  createdAt: 'Jun 11, 2026',
  status: 'Active',
  avatar: '',
  studentCode: 'PNC2025-001',
  placeOfBirth: 'Kampong Cham',
  gender: 'Male',
  classId: '1',
})

// Class Cache Mapping
interface ClassItem {
  id: string
  name: string
  batchYear: number
  createdAt: string
  updatedAt: string
}

const CLASSES_CACHE_KEY = 'classes_cache'

const defaultClasses: ClassItem[] = [
  {
    id: '1',
    name: 'WEB C',
    batchYear: 2025,
    createdAt: '2026-06-11 21:15:34.000',
    updatedAt: '2026-06-11 21:15:34.000',
  },
  {
    id: '2',
    name: 'WEB B',
    batchYear: 2025,
    createdAt: '2026-06-11 21:46:30.000',
    updatedAt: '2026-06-11 21:46:30.000',
  }
]

function loadClasses(): Record<string, ClassItem> {
  // Sync the latest defaultClasses to localStorage to avoid stale cached values in client browser
  localStorage.setItem(CLASSES_CACHE_KEY, JSON.stringify(defaultClasses))
  
  const map: Record<string, ClassItem> = {}
  defaultClasses.forEach(c => {
    map[c.id] = c
  })
  return map
}

const classCache = ref<Record<string, ClassItem>>(loadClasses())

const storeStudent = computed(() => {
  return store.students.find(s => s.id === studentId.value)
})

const updateLocalStudent = () => {
  if (storeStudent.value) {
    const s = storeStudent.value
    student.value = {
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      address: s.placeOfBirth,
      createdAt: s.createdAt,
      status: s.status,
      avatar: s.profileImage || '',
      studentCode: s.studentCode,
      placeOfBirth: s.placeOfBirth,
      gender: s.gender,
      classId: s.classId,
    }
  }
}

watch(storeStudent, () => {
  updateLocalStudent()
}, { immediate: true })

onMounted(async () => {
  if (!store.fetched) {
    await store.fetchStudents()
  }
  updateLocalStudent()
})

const statusClass = (s: string) => {
  switch (s) {
    case 'Active': return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
    case 'Suspended': return 'text-amber-700 bg-amber-50 border border-amber-200'
    case 'Graduated': return 'text-blue-700 bg-blue-50 border border-blue-200'
    default: return 'text-slate-500 bg-slate-50 border border-slate-200'
  }
}


// Awards & Recognitions
const awards = ref([
  '2nd position in Spanish Olympiad',
  '10th position in Mathematics Olympiad',
  'Student of the Year',
  'Outstanding Punctuality Award',
  'Perfect Attendance Award',
  'Most Improved Student',
  'Creative Thinker Award',
])

// Learning activity data based on timeframe
const activityTimeframe = ref<'This Week' | 'Last Week' | 'This Month'>('This Week')

const activityOptions: DropdownOption[] = [
  { value: 'This Week', label: 'This Week' },
  { value: 'Last Week', label: 'Last Week' },
  { value: 'This Month', label: 'This Month' },
]

const activityData = computed(() => {
  if (activityTimeframe.value === 'Last Week') {
    return {
      hours: 38,
      minutes: 15,
      days: [
        { name: 'Mon', yellow: 30, pink: 15, blue: 10 },
        { name: 'Tue', yellow: 25, pink: 30, blue: 20 },
        { name: 'Wed', yellow: 40, pink: 5, blue: 15 },
        { name: 'Thu', yellow: 50, pink: 10, blue: 5 },
        { name: 'Fri', yellow: 15, pink: 20, blue: 10 },
        { name: 'Sat', yellow: 20, pink: 25, blue: 30 },
        { name: 'Sun', yellow: 10, pink: 10, blue: 10 },
      ],
      courses: [
        { name: 'French for Beginners', hours: 14, color: 'bg-rose-400 text-rose-500 bg-rose-50' },
        { name: 'Spanish for Beginners', hours: 16, color: 'bg-amber-400 text-amber-500 bg-amber-50' },
        { name: 'Business Communica...', hours: 8.25, color: 'bg-indigo-400 text-indigo-500 bg-indigo-50' },
      ],
    }
  } else if (activityTimeframe.value === 'This Month') {
    return {
      hours: 154,
      minutes: 45,
      days: [
        { name: 'Mon', yellow: 60, pink: 20, blue: 10 },
        { name: 'Tue', yellow: 55, pink: 25, blue: 15 },
        { name: 'Wed', yellow: 70, pink: 15, blue: 10 },
        { name: 'Thu', yellow: 65, pink: 20, blue: 5 },
        { name: 'Fri', yellow: 45, pink: 15, blue: 20 },
        { name: 'Sat', yellow: 80, pink: 10, blue: 5 },
        { name: 'Sun', yellow: 30, pink: 5, blue: 10 },
      ],
      courses: [
        { name: 'French for Beginners', hours: 58, color: 'bg-rose-400 text-rose-500 bg-rose-50' },
        { name: 'Spanish for Beginners', hours: 62, color: 'bg-amber-400 text-amber-500 bg-amber-50' },
        { name: 'Business Communica...', hours: 34.75, color: 'bg-indigo-400 text-indigo-500 bg-indigo-50' },
      ],
    }
  }
  // Default: This Week
  return {
    hours: 42,
    minutes: 30,
    days: [
      { name: 'Mon', yellow: 40, pink: 20, blue: 15 },
      { name: 'Tue', yellow: 20, pink: 45, blue: 10 },
      { name: 'Wed', yellow: 50, pink: 10, blue: 5 },
      { name: 'Thu', yellow: 60, pink: 5, blue: 5 },
      { name: 'Fri', yellow: 20, pink: 15, blue: 15 },
      { name: 'Sat', yellow: 30, pink: 30, blue: 25 },
      { name: 'Sun', yellow: 35, pink: 5, blue: 10 },
    ],
    courses: [
      { name: 'French for Beginners', hours: 16, color: 'bg-rose-400 text-rose-500 bg-rose-50' },
      { name: 'Spanish for Beginners', hours: 16, color: 'bg-amber-400 text-amber-500 bg-amber-50' },
      { name: 'Business Communica...', hours: 10.5, color: 'bg-indigo-400 text-indigo-500 bg-indigo-50' },
    ],
  }
})

// Performance timeframe selection
const performanceTimeframe = ref<'Last 6 Months' | 'Last Month' | 'This Year'>('Last 6 Months')

const performanceOptions: DropdownOption[] = [
  { value: 'Last 6 Months', label: 'Last 6 Months' },
  { value: 'Last Month', label: 'Last Month' },
  { value: 'This Year', label: 'This Year' },
]

const performanceMetrics = computed(() => {
  if (performanceTimeframe.value === 'Last Month') {
    return {
      score: 85,
      gaugeOffset: 110 * (1 - 0.85),
      participation: 60,
      quiz: 12,
      exam: 8,
      absent: 5,
      chartPath: 'M 10 50 Q 30 10, 50 20 T 90 45 T 130 35 T 170 30 T 210 42 T 250 25',
      chartFill: 'M 10 50 Q 30 10, 50 20 T 90 45 T 130 35 T 170 30 T 210 42 T 250 25 L 250 75 L 10 75 Z',
    }
  } else if (performanceTimeframe.value === 'This Year') {
    return {
      score: 76,
      gaugeOffset: 110 * (1 - 0.76),
      participation: 50,
      quiz: 16,
      exam: 10,
      absent: 14,
      chartPath: 'M 10 65 Q 30 35, 50 45 T 90 60 T 130 50 T 170 45 T 210 55 T 250 40',
      chartFill: 'M 10 65 Q 30 35, 50 45 T 90 60 T 130 50 T 170 45 T 210 55 T 250 40 L 250 75 L 10 75 Z',
    }
  }
  // Default: Last 6 Months
  return {
    score: 80,
    gaugeOffset: 110 * (1 - 0.80),
    participation: 55,
    quiz: 15,
    exam: 10,
    absent: 10,
    chartPath: 'M 10 60 Q 30 20, 50 30 T 90 55 T 130 45 T 170 40 T 210 52 T 250 35',
    chartFill: 'M 10 60 Q 30 20, 50 30 T 90 55 T 130 45 T 170 40 T 210 52 T 250 35 L 250 75 L 10 75 Z',
  }
})

// Enrolled Courses Data
interface Course {
  id: number
  title: string
  category: string
  image: string
  videos: number
  hours: number
  progress: number
  status: 'Ongoing' | 'Completed'
  score: number
  certificate: string
  emoji: string
  price: number
  academy: string
}

const courses = ref<Course[]>([
  { id: 1, title: 'French for Beginners', category: 'Language • Beginner', image: 'https://images.unsplash.com/photo-1523050853064-90ff001f391b?auto=format&fit=crop&q=80&w=400', videos: 15, hours: 25, progress: 60, status: 'Ongoing', score: 78, certificate: 'None', emoji: '🇫🇷', price: 29.00, academy: 'Language Pro' },
  { id: 2, title: 'Mathematics', category: 'Maths • Intermediate', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400', videos: 20, hours: 40, progress: 50, status: 'Ongoing', score: 72, certificate: 'None', emoji: '📐', price: 39.00, academy: 'STEM Academy' },
  { id: 3, title: 'Spanish for Beginners', category: 'Language • Beginner', image: 'https://images.unsplash.com/photo-1527567059277-7811985da53b?auto=format&fit=crop&q=80&w=400', videos: 18, hours: 30, progress: 100, status: 'Completed', score: 90, certificate: 'Olympiad', emoji: '🇪🇸', price: 29.00, academy: 'Language Pro' },
  { id: 4, title: 'Environmental Studies', category: 'Science • Beginner', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=400', videos: 19, hours: 29, progress: 35, status: 'Ongoing', score: 64, certificate: 'None', emoji: '🌱', price: 25.00, academy: 'Green Earth' },
])

const courseSearchQuery = inject<Ref<string>>('searchQuery', ref(''))
const courseStatusFilter = ref<'All Status' | 'Ongoing' | 'Completed'>('All Status')

const courseStatusOptions: DropdownOption[] = [
  { value: 'All Status', label: 'All Status' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
]

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(courseSearchQuery.value.toLowerCase()) ||
                          course.category.toLowerCase().includes(courseSearchQuery.value.toLowerCase())
    const matchesStatus = courseStatusFilter.value === 'All Status' || course.status === courseStatusFilter.value
    return matchesSearch && matchesStatus
  })
})

import { getErrorMessage } from '@/services/api'

// Modal controls for editing student
const showEditModal = ref(false)
const editFormData = ref({ ...student.value })
const formErrors = ref<Record<string, string>>({})
const studentFileInput = ref<HTMLInputElement | null>(null)
const selectedStudentFile = ref<File | null>(null)

const openEditModal = () => {
  const cleanFormData = { ...student.value }
  if (cleanFormData.name === '—') cleanFormData.name = ''
  if (cleanFormData.email === '—') cleanFormData.email = ''
  if (cleanFormData.phone === '—') cleanFormData.phone = ''
  if (cleanFormData.address === '—') cleanFormData.address = ''
  
  editFormData.value = cleanFormData
  selectedStudentFile.value = null
  formErrors.value = {}
  showEditModal.value = true
}

function onStudentFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedStudentFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    editFormData.value.avatar = reader.result as string
  }
  reader.readAsDataURL(file)
}

const handleSaveStudent = async () => {
  // Simple validation
  const errors: Record<string, string> = {}
  if (!editFormData.value.name.trim()) errors.name = 'Name is required'
  if (!editFormData.value.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.value.email)) {
    errors.email = 'Invalid email format'
  }

  if (Object.keys(errors).length > 0) {
    formErrors.value = errors
    return
  }

  try {
    const nameParts = editFormData.value.name.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    
    const payload = {
      studentCode: editFormData.value.studentCode,
      firstName: firstName,
      lastName: lastName,
      email: editFormData.value.email.trim(),
      phone: editFormData.value.phone?.trim() || null,
      placeOfBirth: editFormData.value.address?.trim() || null,
      classId: editFormData.value.classId,
      status: editFormData.value.status?.toLowerCase() || 'active',
    }
    
    const updatedStudent = await store.updateStudent(student.value.id, payload, selectedStudentFile.value)
    
    student.value = { 
      ...editFormData.value,
      avatar: updatedStudent?.profileImage || editFormData.value.avatar
    }
    showEditModal.value = false
    toast.showToast('Student updated successfully!')
  } catch (err) {
    console.error('Failed to update student in database:', err)
    formErrors.value = { server: getErrorMessage(err, 'Failed to update student') }
  }
  
  selectedStudentFile.value = null
}

</script>

<template>
  <div class="space-y-6 max-w-[1600px] mx-auto pb-8 text-left">
    
    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      
      <!-- Left Profile Details Column -->
      <div class="xl:col-span-1 space-y-6">
        <div class="bg-white rounded-[5px] border border-slate-100 shadow-md overflow-hidden text-center flex flex-col">
          <!-- Banner Header background -->
          <div class="h-20 bg-[#d8b4fe]/60 relative select-none"></div>

          <!-- Avatar -->
          <div class="relative -mt-12 flex justify-center">
            <div class="relative w-20 h-20 rounded-full border-4 border-white bg-slate-100 shadow-sm overflow-hidden flex items-center justify-center">
               <IconUser class="absolute inset-0 m-auto w-10 h-10 text-slate-300" />
               <img 
                 :src="student.avatar" 
                 @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
                 class="relative z-10 w-full h-full object-cover"
                 :alt="student.name"
               />
            </div>
          </div>

          <!-- Basic Info -->
          <div class="px-4 pt-3 pb-2">
            <div class="flex justify-center gap-1.5 flex-wrap mb-2">
              <span class="px-2 py-0.5 rounded-[3px] border border-blue-200 text-blue-600 text-[10px] font-bold bg-blue-50/50 uppercase tracking-wider">
                {{ student.id }}
              </span>
              <span v-if="student.classId" class="px-2 py-0.5 rounded-[3px] border border-slate-200 text-[#3b4b6b] text-[10px] font-bold bg-slate-50 uppercase tracking-wider">
                {{ classCache[student.classId]?.name || student.classId }}
              </span>
              <span :class="['px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border', statusClass(student.status)]">
                {{ student.status }}
              </span>
            </div>
            <h3 class="text-sm font-bold text-[#0f172a]">{{ student.name }}</h3>
            <p class="text-xs font-bold text-slate-400 mt-0.5 select-none">Enrolled on {{ student.createdAt }}</p>
          </div>

          <!-- Quick Action Buttons -->
          <div class="px-4 py-2 flex items-center justify-center gap-2">
            <a 
              :href="`tel:${student.phone}`"
              class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Call Student"
            >
              <IconPhone class="w-4 h-4" />
            </a>
            <a 
              :href="`mailto:${student.email}`"
              class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              title="Email Student"
            >
              <IconMail class="w-4 h-4" />
            </a>
            <button 
              class="flex-1 h-7 rounded-[5px] bg-[#eef2ff] hover:bg-[#e0e7ff] text-[#6366f1] font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <IconMessage class="w-4 h-4" />
              Chat
            </button>
          </div>

          <div class="border-t border-slate-100 mx-4"></div>

          <!-- Contact Details -->
          <div class="px-4 py-3 space-y-3 text-left">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact</h4>
            <div class="space-y-2">
              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-[5px] bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 mt-0.5 shadow-inner">
                  <IconMail class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Email</p>
                  <p class="text-xs font-bold text-[#0f172a] mt-0.5 break-all">{{ student.email }}</p>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-[5px] bg-purple-50 flex items-center justify-center text-purple-500 shrink-0 mt-0.5 shadow-inner">
                  <IconPhone class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Phone Number</p>
                  <p class="text-xs font-bold text-[#0f172a] mt-0.5">{{ student.phone }}</p>
                </div>
              </div>

              <div class="flex items-start gap-2.5">
                <div class="w-7 h-7 rounded-[5px] bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 mt-0.5 shadow-inner">
                  <IconMapPin class="w-4 h-4" />
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Address</p>
                  <p class="text-xs font-bold text-[#0f172a] mt-0.5 leading-relaxed">{{ student.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 mx-4"></div>

          <!-- Awards & Recognitions -->
          <div class="px-4 py-3 space-y-3 text-left">
            <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Awards & Recognisations</h4>
            <ul class="space-y-2">
              <li 
                v-for="(award, idx) in awards" 
                :key="idx" 
                class="flex items-start gap-2 text-xs font-bold text-[#475569]"
              >
                <IconAward class="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>{{ award }}</span>
              </li>
            </ul>
          </div>
          <div class="px-4 pb-4 mt-auto">
            <button 
              @click="openEditModal"
              class="w-full py-1.5 rounded-[5px] border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 transition-colors shadow-sm"
            >
              <IconEdit class="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Right Dashboard Column -->
      <div class="xl:col-span-3 space-y-6">
        
        <!-- Two Cards Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Learning Activity Card -->
          <div class="bg-white rounded-[5px] border border-slate-100 shadow-md p-4 flex flex-col relative text-left">
            <div class="flex justify-between items-center mb-3 z-10">
              <h3 class="text-sm font-bold text-[#0f172a]">Learning Activity</h3>
              <div class="flex items-center gap-2">
                <BaseDropdown v-model="activityTimeframe" :options="activityOptions" size="sm" position="right" />

                <!-- Triple Dots button -->
                <button class="p-1 hover:bg-slate-50 rounded-[5px] text-slate-400 hover:text-slate-600 transition-colors">
                  <IconDots class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Learning stats -->
            <div class="mb-2 select-none">
              <h2 class="text-base font-bold text-[#0f172a] inline-flex items-baseline gap-1">
                {{ activityData.hours }}
                <span class="text-[10px] font-bold text-slate-400">hours</span>
                {{ activityData.minutes }}
                <span class="text-[10px] font-bold text-slate-400">minutes</span>
              </h2>
            </div>

            <!-- Stacked bar chart -->
            <div class="flex justify-between items-end gap-1.5 h-40 select-none px-2 relative mb-3 pt-2 border-b border-slate-100">
              <!-- Grid line overlays -->
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 text-[10px] text-slate-300 font-bold select-none z-0">
                <div class="border-b border-dashed border-slate-100 w-full h-0"></div>
                <div class="border-b border-dashed border-slate-100 w-full h-0"></div>
                <div class="border-b border-dashed border-slate-100 w-full h-0"></div>
                <div class="border-b border-dashed border-slate-100 w-full h-0"></div>
              </div>

              <!-- Day Column Bars -->
              <div 
                v-for="day in activityData.days" 
                :key="day.name" 
                class="flex flex-col items-center flex-1 h-full z-10"
              >
                <!-- Stacked Column rail -->
                <div class="w-4 sm:w-5 h-[85%] rounded-full bg-[#f8f9fa] flex flex-col justify-end overflow-hidden mb-1 relative group shadow-inner">
                  <!-- Segments -->
                  <div 
                    class="bg-[#818cf8] w-full transition-all duration-500 ease-out cursor-pointer hover:brightness-95" 
                    :style="`height: ${day.blue}%`"
                    :title="`French: ${day.blue}%`"
                  ></div>
                  <div 
                    class="bg-[#f472b6] w-full transition-all duration-500 ease-out cursor-pointer hover:brightness-95" 
                    :style="`height: ${day.pink}%`"
                    :title="`Spanish: ${day.pink}%`"
                  ></div>
                  <div 
                    class="bg-[#fbbf24] w-full transition-all duration-500 ease-out cursor-pointer hover:brightness-95" 
                    :style="`height: ${day.yellow}%`"
                    :title="`Business: ${day.yellow}%`"
                  ></div>
                </div>
                <!-- X-Axis label -->
                <span class="text-[10px] font-bold text-[#64748b] leading-none">{{ day.name }}</span>
              </div>
            </div>

            <!-- Legend boxes -->
            <div class="grid grid-cols-3 gap-2 mt-auto text-left select-none">
              <div 
                v-for="course in activityData.courses" 
                :key="course.name"
                class="p-2 rounded-[5px] border border-slate-100 flex flex-col"
                :class="course.color.split(' ').slice(2).join(' ')"
              >
                <span class="text-[10px] font-bold uppercase tracking-wide truncate leading-none" :class="course.color.split(' ')[1]">
                  {{ course.hours }} Hours
                </span>
                <span class="text-xs font-bold text-[#475569] mt-1 truncate leading-tight">
                  {{ course.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Performance Card -->
          <div class="bg-white rounded-[5px] border border-slate-100 shadow-md p-4 flex flex-col relative text-left">
            <div class="flex justify-between items-center mb-3 z-10">
              <h3 class="text-sm font-bold text-[#0f172a]">Performance</h3>
              <BaseDropdown v-model="performanceTimeframe" :options="performanceOptions" size="sm" position="right" />
            </div>

            <!-- Gauge Chart and legend -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              
              <!-- Circular Arc Gauge -->
              <div class="sm:col-span-5 flex flex-col items-center justify-center relative select-none">
                <div class="w-28 h-18 overflow-hidden relative mt-1">
                  <svg class="w-28 h-28 transform rotate-180" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="50%" stop-color="#fbbf24" />
                        <stop offset="100%" stop-color="#f43f5e" />
                      </linearGradient>
                    </defs>
                    <!-- Arc Rail -->
                    <path 
                      d="M 15 50 A 35 35 0 0 1 85 50" 
                      fill="none" 
                      stroke="#f1f5f9" 
                      stroke-width="8" 
                      stroke-linecap="round"
                    />
                    <!-- Active Score Arc -->
                    <path 
                      d="M 15 50 A 35 35 0 0 1 85 50" 
                      fill="none" 
                      stroke="url(#gaugeGradient)" 
                      stroke-width="8" 
                      stroke-linecap="round"
                      stroke-dasharray="110" 
                      :stroke-dashoffset="performanceMetrics.gaugeOffset"
                      class="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <!-- Score display text -->
                  <div class="absolute inset-x-0 bottom-1 flex flex-col items-center leading-none">
                    <span class="text-sm font-bold text-[#0f172a]">{{ performanceMetrics.score }}%</span>
                    <span class="text-[10px] font-bold text-slate-400 mt-0.5 select-none">Total Score</span>
                  </div>
                </div>
              </div>

              <!-- Legend Details -->
              <div class="sm:col-span-7 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] select-none">
                <div class="flex items-center gap-1.5 font-bold text-slate-500">
                  <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  <span class="flex-1 truncate">Participation</span>
                  <span class="text-[#0f172a] font-bold ml-auto">{{ performanceMetrics.participation }}%</span>
                </div>
                <div class="flex items-center gap-1.5 font-bold text-slate-500">
                  <span class="w-2 h-2 bg-amber-400 rounded-full"></span>
                  <span class="flex-1 truncate">Class Quiz</span>
                  <span class="text-[#0f172a] font-bold ml-auto">{{ performanceMetrics.quiz }}%</span>
                </div>
                <div class="flex items-center gap-1.5 font-bold text-slate-500">
                  <span class="w-2 h-2 bg-orange-400 rounded-full"></span>
                  <span class="flex-1 truncate">Exam</span>
                  <span class="text-[#0f172a] font-bold ml-auto">{{ performanceMetrics.exam }}%</span>
                </div>
                <div class="flex items-center gap-1.5 font-bold text-slate-500">
                  <span class="w-2 h-2 bg-rose-500 rounded-full"></span>
                  <span class="flex-1 truncate">Absent</span>
                  <span class="text-[#0f172a] font-bold ml-auto">{{ performanceMetrics.absent }}%</span>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-50 my-3"></div>

            <!-- Line/Area Chart widget -->
            <div class="relative flex flex-col flex-1 select-none text-left">
              <div class="flex items-baseline justify-between z-10 mb-1">
                <div>
                  <h4 class="text-sm font-bold text-[#0f172a] inline-flex items-baseline gap-1.5 leading-none">
                    {{ performanceMetrics.score }}%
                    <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[5px]">+3.4%</span>
                  </h4>
                  <p class="text-[10px] font-bold text-slate-400 mt-0.5 select-none leading-none">Last 6 Months</p>
                </div>
              </div>

              <!-- SVG Area Chart -->
              <div class="h-20 w-full relative overflow-hidden">
                <svg class="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.3" />
                      <stop offset="100%" stop-color="#818cf8" stop-opacity="0.0" />
                    </linearGradient>
                  </defs>
                  <!-- Filled Area -->
                  <path 
                    :d="performanceMetrics.chartFill" 
                    fill="url(#areaGradient)"
                    class="transition-all duration-700 ease-out"
                  />
                  <!-- Stroke Line -->
                  <path 
                    :d="performanceMetrics.chartPath" 
                    fill="none" 
                    stroke="#6366f1" 
                    stroke-width="2" 
                    stroke-linecap="round"
                    class="transition-all duration-700 ease-out"
                  />
                </svg>
                <!-- Labels overlay -->
                <div class="absolute bottom-0 inset-x-0 flex justify-between px-1 text-[10px] font-bold text-slate-400 leading-none select-none">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </div>
              </div>
            </div>

            <!-- Warning / Motivation Banner -->
            <div class="mt-3 p-2.5 bg-amber-50/70 border border-amber-100 rounded-[5px] flex items-start gap-2">
              <span class="text-sm shrink-0">😊</span>
              <p class="text-[10px] font-bold text-[#b45309] leading-relaxed">
                Success is the sum of small efforts, repeated day in and day out. Keep pushing forward!
              </p>
            </div>
          </div>
        </div>

        <!-- Enrolled Courses Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-800">Enrolled Courses</h3>
            <div class="flex items-center gap-2">
              <div class="relative w-40">
                <input 
                  v-model="courseSearchQuery"
                  type="text" 
                  placeholder="Search courses..."
                  class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
                />
                <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <BaseDropdown v-model="courseStatusFilter" :options="courseStatusOptions" size="sm" position="right" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="course in filteredCourses" 
              :key="course.id"
              class="bg-white rounded-[3px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all cursor-pointer"
            >
              <div class="relative h-24">
                <img :src="course.image" :alt="course.title" class="w-full h-full object-cover" />
                <div class="absolute bottom-1.5 left-1.5">
                  <span class="px-1.5 py-0.5 bg-indigo-600 text-white text-[7px] font-bold rounded-[2px] shadow-sm uppercase">
                    {{ course.category.split(' • ')[0] }}
                  </span>
                </div>
              </div>
              <div class="p-2.5 space-y-2.5">
                <h4 class="text-[10px] font-bold text-slate-800 line-clamp-1 leading-tight">
                  {{ course.title }}
                </h4>
                <div class="flex items-center justify-between text-[9px]">
                  <div class="flex items-center gap-1 text-slate-400 font-bold">
                    <span>{{ course.emoji }}</span>
                    <span>{{ course.academy }}</span>
                  </div>
                  <div class="flex items-center gap-1 text-indigo-600 font-bold">
                    $ {{ course.price.toFixed(2) }}
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="flex justify-between items-center text-[9px] font-bold">
                    <span class="text-slate-400">Progress</span>
                    <span class="text-indigo-600">{{ course.progress }}%</span>
                  </div>
                  <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-indigo-600 transition-all duration-500"
                      :style="{ width: `${course.progress}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="filteredCourses.length === 0" class="bg-white rounded-[3px] p-6 text-center border border-dashed border-slate-200">
            <IconFileText class="mx-auto w-6 h-6 text-slate-300" />
            <p class="text-[10px] font-bold text-slate-500 mt-2">No courses found</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Student Profile Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="showEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click="showEditModal = false"
        >
          <div 
            class="w-full max-w-md bg-white rounded-[5px] shadow-xl overflow-hidden"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-900">Edit Student Details</h2>
              <button 
                @click="showEditModal = false"
                class="p-1 rounded-[5px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <IconX class="w-4 h-4" />
              </button>
            </div>

            <!-- Form -->
            <div class="px-4 py-3 space-y-3 text-left">
              <!-- Server Error Banner -->
              <div v-if="formErrors.server" class="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-[3px] text-xs font-semibold text-red-700">
                {{ formErrors.server }}
              </div>
              <!-- Profile Image Uploader -->
              <div class="flex items-center gap-4 border-b border-slate-100 pb-3">
                <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="editFormData.avatar" :src="editFormData.avatar" class="w-full h-full object-cover" />
                  <IconUser v-else class="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Image</label>
                  <button 
                    @click="studentFileInput?.click()" 
                    type="button"
                    class="px-2.5 py-1 bg-white border border-slate-200 rounded-[3px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Choose Photo
                  </button>
                  <input 
                    ref="studentFileInput" 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="onStudentFileSelected" 
                  />
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  v-model="editFormData.name"
                  type="text" 
                  class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-indigo-300 focus:outline-none transition-colors"
                  :class="{ 'border-rose-300 focus:border-rose-400': formErrors.name }"
                />
                <span v-if="formErrors.name" class="text-[10px] font-bold text-rose-500 mt-0.5">{{ formErrors.name }}</span>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input 
                  v-model="editFormData.email"
                  type="email" 
                  class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-indigo-300 focus:outline-none transition-colors"
                  :class="{ 'border-rose-300 focus:border-rose-400': formErrors.email }"
                />
                <span v-if="formErrors.email" class="text-[10px] font-bold text-rose-500 mt-0.5">{{ formErrors.email }}</span>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input 
                  v-model="editFormData.phone"
                  type="text" 
                  class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-indigo-300 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Home Address</label>
                <textarea 
                  v-model="editFormData.address"
                  rows="2"
                  class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-indigo-300 focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <!-- Class & Status Selection -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class</label>
                  <select 
                    v-model="editFormData.classId"
                    class="w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-indigo-300 bg-white"
                  >
                    <option v-for="c in Object.values(classCache)" :key="c.id" :value="c.id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <select 
                    v-model="editFormData.status"
                    class="w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-indigo-300 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button 
                @click="showEditModal = false"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                @click="handleSaveStudent"
                class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Scoped styles for transition/smooth height animations */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
