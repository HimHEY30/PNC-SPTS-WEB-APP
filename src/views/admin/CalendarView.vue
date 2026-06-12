<script setup lang="ts">
import { ref, computed, inject, type Ref, watch, onMounted, onUnmounted } from 'vue'
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconPlus,
  IconX,
  IconClock,
  IconCalendar,
  IconBell,
  IconRefresh,
  IconMessage,
  IconFileText,
  IconDots,
} from '@tabler/icons-vue'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  platform: 'A' | 'B' | 'C' | 'D'
  authorName: string
  authorAvatar: string
  time?: string
}

const currentDate = ref(new Date())
const selectedDate = ref(new Date())

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const miniWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const monthYearText = computed(() => {
  return `${monthNames[currentMonth.value]}, ${currentYear.value}`
})

// Platforms metadata with avatars matching original code
const platforms = {
  A: { name: 'Platform A', color: 'amber', avatar: '/src/assets/images/nitara_avatar.png' },
  B: { name: 'Platform B', color: 'rose', avatar: '/src/assets/images/jelil_avatar.png' },
  C: { name: 'Platform C', color: 'blue', avatar: '/src/assets/images/tola_avatar.png' },
  D: { name: 'Platform D', color: 'emerald', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
}

const contentTypes = [
  'Flora Website Design Meeting',
  'Apply for Leave Applications',
  'Final Submission Meeting of IKEA Tech Project',
  'Meetify Jira Ticket Meeting With Design Team',
  'New Project Design Brief Call',
  'Development & Design Team Meeting',
  'Go Corona Website Design Meeting',
  'UNO Bank App Client Call',
  'Other'
]

// Navigation
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Calendar Grid Days Generation (Sunday-start)
const daysInGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

  const totalDays = new Date(year, month + 1, 0).getDate()
  const totalDaysPrevMonth = new Date(year, month, 0).getDate()

  const grid = []

  // Fill in days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = totalDaysPrevMonth - i
    const date = new Date(year, month - 1, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      key: `prev-${day}`,
    })
  }

  // Fill in days from current month
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      key: `curr-${day}`,
    })
  }

  // Fill in days from next month to complete the grid (35 or 42 cells)
  const totalCells = grid.length > 35 ? 42 : 35
  const remaining = totalCells - grid.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      key: `next-${day}`,
    })
  }

  return grid
})

const weeksInGrid = computed(() => {
  const days = daysInGrid.value
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
})

// Mini calendar grid generation (Monday-start)
const miniDaysInGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  let startDayOfWeek = firstDay.getDay() - 1
  if (startDayOfWeek < 0) startDayOfWeek = 6 // Sunday is 6

  const totalDays = new Date(year, month + 1, 0).getDate()
  const totalDaysPrevMonth = new Date(year, month, 0).getDate()

  const grid = []

  // Fill in days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = totalDaysPrevMonth - i
    const date = new Date(year, month - 1, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      key: `mini-prev-${day}`,
    })
  }

  // Fill in days from current month
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      key: `mini-curr-${day}`,
    })
  }

  // Fill in days from next month to complete the grid
  const totalCells = grid.length > 35 ? 42 : 35
  const remaining = totalCells - grid.length
  for (let day = 1; day <= remaining; day++) {
    const date = new Date(year, month + 1, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: false,
      key: `mini-next-${day}`,
    })
  }

  return grid
})

const isSelectedDate = (date: Date) => {
  return (
    date.getDate() === selectedDate.value.getDate() &&
    date.getMonth() === selectedDate.value.getMonth() &&
    date.getFullYear() === selectedDate.value.getFullYear()
  )
}

const selectDate = (date: Date) => {
  selectedDate.value = date
  currentDate.value = date
}

const getYearMonthStr = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const buildDefaultEvents = (): CalendarEvent[] => {
  const now = new Date()
  const ym = getYearMonthStr(now)
  
  const nextMonthObj = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nym = getYearMonthStr(nextMonthObj)
  
  return [
    { id: '1', title: 'Flora Website Design Meeting', date: `${ym}-01`, platform: 'C', authorName: 'Tola', authorAvatar: '/src/assets/images/tola_avatar.png', time: '08:00 - 08:45 AM' },
    { id: '2', title: 'Apply for Leave Applications', date: `${ym}-05`, platform: 'B', authorName: 'Jelil', authorAvatar: '/src/assets/images/jelil_avatar.png', time: '05 - 06 March, 2020' },
    { id: '3', title: 'Final Submission Meeting of IKEA Tech Project', date: `${ym}-10`, platform: 'D', authorName: 'Sophea', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '09:00 AM' },
    { id: '4', title: 'Meetify Jira Ticket Meeting With Design Team', date: `${ym}-14`, platform: 'C', authorName: 'Tola', authorAvatar: '/src/assets/images/tola_avatar.png', time: '09:00 - 09:45 AM' },
    { id: '5', title: 'New Project Design Brief Call', date: `${ym}-19`, platform: 'A', authorName: 'Nitara', authorAvatar: '/src/assets/images/nitara_avatar.png', time: '09:00 - 10:30 AM' },
    { id: '6', title: 'Development & Design Team Meeting', date: `${ym}-24`, platform: 'B', authorName: 'Sophea', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', time: '10:00 - 10:30 AM' },
    { id: '7', title: 'Go Corona Website Design Meeting', date: `${ym}-29`, platform: 'C', authorName: 'Tola', authorAvatar: '/src/assets/images/tola_avatar.png', time: '10:30 - 11:30 AM' },
    { id: '8', title: 'UNO Bank App Client Call', date: `${nym}-02`, platform: 'C', authorName: 'Tola', authorAvatar: '/src/assets/images/tola_avatar.png', time: '10:30 - 12:00 AM' },
  ]
}

// Persistent LocalStorage functions
const EVENTS_CACHE_KEY = 'content_calendar_events'

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_CACHE_KEY)
    if (!raw) return buildDefaultEvents()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return buildDefaultEvents()
    return parsed
  } catch {
    return buildDefaultEvents()
  }
}

function saveEvents(data: CalendarEvent[]) {
  try {
    localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(data))
  } catch {}
}

const events = ref<CalendarEvent[]>(loadEvents())

watch(events, (newVal) => {
  saveEvents(newVal)
}, { deep: true })

const localSearchQuery = ref('')
const globalSearchQuery = inject<Ref<string>>('searchQuery', ref(''))
const combinedSearch = computed(() => globalSearchQuery.value || localSearchQuery.value)

const getEventsForDate = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const dateStr = `${yyyy}-${mm}-${dd}`

  let list = events.value.filter(e => e.date === dateStr)

  if (combinedSearch.value.trim()) {
    const q = combinedSearch.value.toLowerCase().trim()
    list = list.filter(e => e.title.toLowerCase().includes(q))
  }

  return list
}

const getEventCardClasses = (platform: 'A' | 'B' | 'C' | 'D') => {
  switch (platform) {
    case 'A': return 'bg-[#fffbeb] border-[#f59e0b] text-[#854d0e] border-l-[3.5px]' // amber/yellow
    case 'B': return 'bg-[#fff1f2] border-[#f43f5e] text-[#9f1239] border-l-[3.5px]' // rose/pink
    case 'C': return 'bg-[#eff6ff] border-[#3b82f6] text-[#1e40af] border-l-[3.5px]' // blue
    case 'D': return 'bg-[#ecfdf5] border-[#10b981] text-[#166534] border-l-[3.5px]' // green
  }
}

const getDotColorClass = (platform: 'A' | 'B' | 'C' | 'D') => {
  switch (platform) {
    case 'A': return 'bg-[#fbbf24]'
    case 'B': return 'bg-[#f43f5e]'
    case 'C': return 'bg-[#3b82f6]'
    case 'D': return 'bg-[#22c55e]'
  }
}

// Add/Edit Event Modals Controls
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

const newEventTitle = ref('Flora Website Design Meeting')
const isCustomTitle = ref(false)
const customTitleText = ref('')
const newEventDate = ref('')
const newEventPlatform = ref<'A' | 'B' | 'C' | 'D'>('C')
const newEventTime = ref('09:00 - 09:45 AM')

const isTitleDropdownOpen = ref(false)
const titleDropdownRef = ref<HTMLElement | null>(null)

function toggleTitleDropdown() {
  isTitleDropdownOpen.value = !isTitleDropdownOpen.value
}

function selectTitle(title: string) {
  newEventTitle.value = title
  isCustomTitle.value = title === 'Other'
  isTitleDropdownOpen.value = false
}

function handleOutsideClick(e: MouseEvent) {
  if (titleDropdownRef.value && !titleDropdownRef.value.contains(e.target as Node)) {
    isTitleDropdownOpen.value = false
  }
}

// Popover Date Picker Panel State
const isDatePickerOpen = ref(false)
const pickerActiveDate = ref(new Date())
const tempDatePickerInputText = ref('')

const formattedNewEventDate = computed(() => {
  if (!newEventDate.value) return ''
  const parts = newEventDate.value.split('-')
  if (parts.length !== 3) return ''
  const y = parseInt(parts[0])
  const m = parseInt(parts[1]) - 1
  const d = parseInt(parts[2])
  const dateObj = new Date(y, m, d)
  return `${monthNames[dateObj.getMonth()].substring(0, 3)} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
})

watch(newEventDate, (newVal) => {
  if (newVal) {
    const parts = newVal.split('-')
    const y = parseInt(parts[0])
    const m = parseInt(parts[1]) - 1
    const d = parseInt(parts[2])
    const dateObj = new Date(y, m, d)
    tempDatePickerInputText.value = `${monthNames[dateObj.getMonth()].substring(0, 3)} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
    pickerActiveDate.value = dateObj
  }
})

const pickerMonthYearText = computed(() => {
  return `${monthNames[pickerActiveDate.value.getMonth()]} ${pickerActiveDate.value.getFullYear()}`
})

const prevPickerMonth = () => {
  pickerActiveDate.value = new Date(pickerActiveDate.value.getFullYear(), pickerActiveDate.value.getMonth() - 1, 1)
}

const nextPickerMonth = () => {
  pickerActiveDate.value = new Date(pickerActiveDate.value.getFullYear(), pickerActiveDate.value.getMonth() + 1, 1)
}

const setPickerToday = () => {
  const today = new Date()
  selectPickerDate(today)
}

const selectPickerDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  newEventDate.value = `${y}-${m}-${d}`
}

const isPickerDateSelected = (date: Date) => {
  if (!newEventDate.value) return false
  const parts = newEventDate.value.split('-')
  if (parts.length !== 3) return false
  return (
    date.getFullYear() === parseInt(parts[0]) &&
    date.getMonth() === parseInt(parts[1]) - 1 &&
    date.getDate() === parseInt(parts[2])
  )
}

const pickerDaysInGrid = computed(() => {
  const year = pickerActiveDate.value.getFullYear()
  const month = pickerActiveDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const startDayOfWeek = firstDay.getDay()

  const totalDays = new Date(year, month + 1, 0).getDate()
  const totalDaysPrevMonth = new Date(year, month, 0).getDate()

  const grid = []

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = totalDaysPrevMonth - i
    grid.push({
      date: new Date(year, month - 1, day),
      dayNumber: day,
      isCurrentMonth: false,
      key: `picker-prev-${day}`,
    })
  }

  for (let day = 1; day <= totalDays; day++) {
    grid.push({
      date: new Date(year, month, day),
      dayNumber: day,
      isCurrentMonth: true,
      key: `picker-curr-${day}`,
    })
  }

  const remaining = 42 - grid.length
  for (let day = 1; day <= remaining; day++) {
    grid.push({
      date: new Date(year, month + 1, day),
      dayNumber: day,
      isCurrentMonth: false,
      key: `picker-next-${day}`,
    })
  }

  return grid
})

const resetForm = () => {
  newEventTitle.value = 'Flora Website Design Meeting'
  isCustomTitle.value = false
  customTitleText.value = ''
  newEventPlatform.value = 'C'
  isDatePickerOpen.value = false
  newEventTime.value = '09:00 - 09:45 AM'
}

const openAddEventModal = (date: Date | null) => {
  resetForm()
  if (date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    newEventDate.value = `${y}-${m}-${d}`
  } else {
    const y = currentDate.value.getFullYear()
    const m = String(currentDate.value.getMonth() + 1).padStart(2, '0')
    const d = String(currentDate.value.getDate()).padStart(2, '0')
    newEventDate.value = `${y}-${m}-${d}`
  }
  showAddModal.value = true
}

const openEditEventModal = (event: CalendarEvent) => {
  selectedEvent.value = event
  const isPreset = contentTypes.includes(event.title)
  newEventTitle.value = isPreset ? event.title : 'Other'
  isCustomTitle.value = !isPreset
  customTitleText.value = isPreset ? '' : event.title
  newEventDate.value = event.date
  newEventPlatform.value = event.platform
  newEventTime.value = event.time || '09:00 - 09:45 AM'
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const handleAddEvent = () => {
  const title = isCustomTitle.value ? customTitleText.value.trim() : newEventTitle.value
  if (!title || !newEventDate.value) return

  events.value.push({
    id: String(Date.now()),
    title: title,
    date: newEventDate.value,
    platform: newEventPlatform.value,
    authorAvatar: platforms[newEventPlatform.value].avatar,
    authorName: platforms[newEventPlatform.value].name,
    time: newEventTime.value,
  })

  closeModal()
}

const handleEditEvent = () => {
  const title = isCustomTitle.value ? customTitleText.value.trim() : newEventTitle.value
  if (!title || !newEventDate.value || !selectedEvent.value) return

  const idx = events.value.findIndex(e => e.id === selectedEvent.value!.id)
  if (idx !== -1) {
    events.value[idx] = {
      ...events.value[idx],
      title: title,
      date: newEventDate.value,
      platform: newEventPlatform.value,
      authorAvatar: platforms[newEventPlatform.value].avatar,
      authorName: platforms[newEventPlatform.value].name,
      time: newEventTime.value,
    }
  }

  closeModal()
}

const handleDeleteEvent = () => {
  if (!selectedEvent.value) return
  events.value = events.value.filter(e => e.id !== selectedEvent.value!.id)
  closeModal()
}

const windowAlert = (msg: string) => {
  alert(msg)
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="space-y-6 text-left max-w-[1600px] mx-auto pb-6 relative px-2 font-sans bg-[#f8fafc] min-h-screen">
    
    <!-- Main side-by-side grid container -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6 pt-4">
      
      <!-- Left Main Calendar Card -->
      <div class="xl:col-span-3 bg-white rounded-[5px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
        
        <!-- Left Panel Header -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 select-none">
          <!-- Title & Month Navigation -->
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-black text-[#1e293b] tracking-tight">Schedule Task</h2>
            <h3 class="text-lg font-bold text-blue-600 tracking-tight">{{ monthYearText }}</h3>
            
            <!-- Pill Navigator -->
            <div class="inline-flex bg-slate-100 rounded-full p-0.5">
              <button 
                @click="prevMonth"
                class="w-6 h-6 rounded-full flex items-center justify-center bg-white text-slate-700 hover:text-slate-900 shadow-sm cursor-pointer transition-all active:scale-95 border-none"
              >
                <IconChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="nextMonth"
                class="w-6 h-6 rounded-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer transition-all active:scale-95 ml-0.5 border-none"
              >
                <IconChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <!-- Dropdown Switcher & View Toggle Options -->
          <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <!-- Dropdown -->
            <button 
              @click="windowAlert('View mode change is locked to Month for high-fidelity representation.')"
              class="flex items-center gap-1.5 border border-slate-200 rounded-[5px] px-3.5 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer bg-white"
            >
              <span>Month</span>
              <IconChevronDown class="w-3.5 h-3.5 text-slate-400" />
            </button>
            
            <!-- List/Grid Switcher Icon -->
            <div class="flex bg-slate-100 rounded-[5px] p-0.5 border border-slate-100">
              <button 
                @click="windowAlert('View toggled to List view')"
                class="p-1 rounded-[3px] text-slate-400 hover:text-slate-600 cursor-pointer transition-colors border-none bg-transparent"
              >
                <IconFileText class="w-4 h-4" />
              </button>
              <button 
                class="p-1 rounded-[3px] bg-white text-blue-600 shadow-sm cursor-default border-none"
              >
                <IconClock class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Main Calendar Grid with Time Column -->
        <div class="grid grid-cols-8 gap-px bg-slate-100 border border-slate-100 rounded-[5px] overflow-hidden mt-2">
          <!-- Row 0: Column Headers -->
          <div class="bg-slate-50/70 p-3 text-center text-[10px] font-black text-slate-400/90 uppercase tracking-widest border-b border-slate-100 flex items-center justify-center min-h-[40px]">
            Time
          </div>
          <div 
            v-for="day in weekDays" 
            :key="day" 
            class="bg-slate-50/70 p-3 text-center text-[10px] font-black text-slate-400/90 uppercase tracking-widest border-b border-slate-100 flex items-center justify-center min-h-[40px]"
          >
            {{ day }}
          </div>

          <!-- Rows 1-5: Grid Content -->
          <template v-for="(week, rowIndex) in weeksInGrid" :key="rowIndex">
            <!-- Time label column -->
            <div class="bg-white p-3 flex items-center justify-center text-xs font-black text-slate-400/90 select-none border-b border-slate-50">
              {{ ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'][rowIndex] || '' }}
            </div>

            <!-- 7 Day cells -->
            <div 
              v-for="cell in week" 
              :key="cell.key"
              class="bg-white min-h-[115px] p-2 flex flex-col justify-between relative group hover:bg-slate-50/15 transition-all border-b border-r border-slate-50"
              :class="{ 'opacity-40': !cell.isCurrentMonth }"
            >
              <!-- Day indicator and select trigger -->
              <div class="flex items-start justify-between">
                <button 
                  @click="selectDate(cell.date)"
                  class="cursor-pointer border-none bg-transparent p-0"
                >
                  <span 
                    v-if="isSelectedDate(cell.date)"
                    class="w-6 h-6 rounded-full bg-[#ff5a5f] text-white flex items-center justify-center text-[10px] font-bold shadow-sm"
                  >
                    {{ cell.dayNumber }}
                  </span>
                  <span 
                    v-else
                    class="text-xs font-black text-slate-700 ml-1.5 hover:text-blue-600 transition-colors"
                  >
                    {{ cell.dayNumber }}
                  </span>
                </button>

                <!-- Quick Plus action -->
                <button 
                  @click="openAddEventModal(cell.date)"
                  class="w-4.5 h-4.5 rounded-full bg-slate-50 hover:bg-[#ff5a5f] hover:text-white flex items-center justify-center text-slate-400 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-inner border-none"
                  title="Add event"
                >
                  <IconPlus class="w-3 h-3" />
                </button>
              </div>

              <!-- Event Cards List -->
              <div class="flex-1 flex flex-col justify-end mt-2 space-y-1.5">
                <div 
                  v-for="event in getEventsForDate(cell.date)" 
                  :key="event.id"
                  class="p-2 rounded-[8px] text-[10px] font-bold text-left cursor-pointer border-l-[3.5px] shadow-sm hover:scale-[1.01] active:scale-95 transition-all space-y-1 select-none"
                  :class="getEventCardClasses(event.platform)"
                  @click.stop="openEditEventModal(event)"
                >
                  <div class="font-extrabold leading-tight truncate" :title="event.title">
                    {{ event.title }}
                  </div>
                  <div class="flex items-center gap-1 opacity-75 text-[8px] font-black">
                    <component :is="event.title.includes('Leave') ? IconCalendar : IconClock" class="w-2.5 h-2.5 shrink-0" />
                    <span class="truncate">{{ event.time || '09:00 - 09:45 AM' }}</span>
                  </div>
                </div>
              </div>

            </div>
          </template>
        </div>

      </div>

      <!-- Right Sidebar Column -->
      <div class="xl:col-span-1 flex flex-col gap-6">
        
        <!-- Mini Calendar widget card -->
        <div class="bg-white rounded-[5px] p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
          <!-- Mini Calendar Header -->
          <div class="flex items-center justify-between select-none">
            <h4 class="text-sm font-bold text-slate-800 tracking-tight">{{ monthYearText }}</h4>
            <div class="inline-flex bg-slate-100 rounded-full p-0.5">
              <button 
                @click="prevMonth"
                class="w-5.5 h-5.5 rounded-full flex items-center justify-center bg-white text-slate-700 hover:text-slate-900 shadow-sm cursor-pointer transition-all active:scale-95 border-none"
              >
                <IconChevronLeft class="w-3 h-3" />
              </button>
              <button 
                @click="nextMonth"
                class="w-5.5 h-5.5 rounded-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer transition-all active:scale-95 ml-0.5 border-none"
              >
                <IconChevronRight class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Mini Calendar Grid -->
          <div class="grid grid-cols-7 gap-y-1 text-center text-xs font-bold text-slate-700">
            <!-- Headers (M T W T F S S) -->
            <div 
              v-for="day in miniWeekDays" 
              :key="day" 
              class="text-[9px] font-black text-slate-400 uppercase py-1 select-none"
            >
              {{ day.substring(0, 1) }}
            </div>

            <!-- Days cells (Monday-start) -->
            <div
              v-for="cell in miniDaysInGrid"
              :key="cell.key"
              class="relative py-1 flex flex-col items-center justify-center"
            >
              <button
                @click="selectDate(cell.date)"
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all cursor-pointer border-none bg-transparent p-0"
                :class="[
                  isSelectedDate(cell.date) 
                    ? 'bg-[#ff5a5f] text-white shadow-sm font-extrabold' 
                    : cell.isCurrentMonth ? 'text-slate-800 hover:bg-slate-100' : 'text-slate-300'
                ]"
              >
                {{ cell.dayNumber }}
              </button>

              <!-- Category Dots (up to 3) -->
              <div v-if="cell.isCurrentMonth && getEventsForDate(cell.date).length > 0" class="flex gap-0.5 justify-center mt-0.5 absolute bottom-[1px]">
                <span 
                  v-for="event in getEventsForDate(cell.date).slice(0, 3)" 
                  :key="event.id"
                  class="w-1 h-1 rounded-full"
                  :class="getDotColorClass(event.platform)"
                ></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Task Action Card -->
        <button 
          @click="openAddEventModal(null)"
          class="flex items-center gap-3 w-full bg-[#ff5a5f] hover:bg-[#e04f53] text-white p-3 rounded-[5px] transition-colors shadow-md cursor-pointer select-none active:scale-[0.99] border-none outline-none text-left"
        >
          <div class="bg-white/20 p-2 rounded-[5px] shrink-0">
            <IconPlus class="w-5 h-5 text-white" />
          </div>
          <span class="font-extrabold text-sm tracking-wide">Add New Task</span>
        </button>

        <!-- Widgets row (Best month & Active project) -->
        <div class="flex gap-3">
          <!-- Best Month Widget -->
          <div class="flex-1 bg-white rounded-[5px] p-4 border border-slate-100 shadow-sm flex flex-col justify-between min-h-[90px] relative select-none">
            <div>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Your Best Month</p>
              <p class="text-sm font-extrabold text-[#1e293b] mt-1">{{ monthNames[currentMonth].substring(0, 5) }}</p>
            </div>
            <p class="text-[10px] font-extrabold text-slate-500 mt-2">200 Hrs Worked</p>
            <button 
              @click="windowAlert('Best Month Metrics Details')"
              class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent"
            >
              <IconDots class="w-4 h-4" />
            </button>
          </div>

          <!-- Active Project Widget -->
          <div class="flex-1 bg-blue-600 text-white rounded-[5px] p-4 shadow-sm flex flex-col justify-between min-h-[90px] relative select-none">
            <div>
              <p class="text-[9px] font-black text-blue-200 uppercase tracking-wider">Active Project</p>
              <p class="text-sm font-extrabold mt-1">{{ monthNames[currentMonth].substring(0, 5) }}</p>
            </div>
            <p class="text-[10px] font-extrabold text-blue-100 mt-2">6 Active Now</p>
            <button 
              @click="windowAlert('Active Projects Details')"
              class="absolute top-4 right-4 text-blue-200 hover:text-white cursor-pointer border-none bg-transparent"
            >
              <IconDots class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Reminders List widget card -->
        <div class="bg-white rounded-[5px] p-5 shadow-sm border border-slate-100 space-y-4">
          <div class="flex items-center justify-between select-none">
            <h3 class="text-sm font-bold text-slate-800">Reminders</h3>
            <button class="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 relative transition-colors cursor-pointer border-none bg-transparent">
              <IconBell class="w-4 h-4" />
              <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#ff5a5f] rounded-full"></span>
            </button>
          </div>

          <div class="space-y-3.5">
            <!-- Subscription Expiring -->
            <div class="flex items-start justify-between gap-3 text-xs">
              <div class="flex gap-2.5">
                <div class="w-8 h-8 rounded-[3px] bg-[#fff1f2] flex items-center justify-center text-[#ff5a5f] shrink-0">
                  <IconRefresh class="w-4 h-4" />
                </div>
                <div class="text-left">
                  <p class="font-bold text-slate-700 leading-tight">Your subscription expires</p>
                  <button @click="windowAlert('Redirecting to subscription renewal...')" class="text-blue-500 hover:underline font-extrabold text-[9px] mt-0.5 cursor-pointer bg-transparent border-none p-0">Renew Now</button>
                </div>
              </div>
              <span class="text-[9px] font-extrabold text-slate-400 shrink-0">6:30 PM</span>
            </div>

            <!-- Unread Messages -->
            <div class="flex items-start justify-between gap-3 text-xs">
              <div class="flex gap-2.5">
                <div class="w-8 h-8 rounded-[3px] bg-[#fffbeb] flex items-center justify-center text-[#d97706] shrink-0">
                  <IconMessage class="w-4 h-4" />
                </div>
                <div class="text-left">
                  <p class="font-bold text-slate-700 leading-tight">34 New unread Message</p>
                  <button @click="windowAlert('Opening inbox...')" class="text-blue-500 hover:underline font-extrabold text-[9px] mt-0.5 cursor-pointer bg-transparent border-none p-0">View All</button>
                </div>
              </div>
              <span class="text-[9px] font-extrabold text-slate-400 shrink-0">5:30 PM</span>
            </div>

            <!-- File Sharing -->
            <div class="flex items-start justify-between gap-3 text-xs">
              <div class="flex gap-2.5">
                <div class="w-8 h-8 rounded-[3px] bg-[#eff6ff] flex items-center justify-center text-[#3b82f6] shrink-0">
                  <IconFileText class="w-4 h-4" />
                </div>
                <div class="text-left">
                  <p class="font-bold text-slate-700 leading-tight">Mike shared a file with you</p>
                  <button @click="windowAlert('Downloading shared file...')" class="text-blue-500 hover:underline font-extrabold text-[9px] mt-0.5 cursor-pointer bg-transparent border-none p-0">View Now</button>
                </div>
              </div>
              <span class="text-[9px] font-extrabold text-slate-400 shrink-0">5:00 PM</span>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- Add Event Modal -->
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
          v-if="showAddModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click="closeModal"
        >
          <!-- background transparent click interceptor to close custom date picker -->
          <div v-if="isDatePickerOpen" class="fixed inset-0 z-[60]" @click="isDatePickerOpen = false"></div>
          
          <div 
            class="bg-white rounded-[5px] shadow-2xl p-5 max-w-sm w-full relative space-y-4 z-[70] animate-fade-in-scale"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 select-none">
              <h3 class="text-xs font-bold text-slate-800">Add Task Event</h3>
              <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
                <IconX class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Content (Form) -->
            <div class="space-y-4 text-left">
              <!-- Content Type Picker -->
              <div ref="titleDropdownRef" class="relative">
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Task / Event Title</label>
                <button
                  type="button"
                  @click.stop="toggleTitleDropdown()"
                  class="w-full border border-slate-200 rounded-[3px] px-2.5 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <span class="truncate">{{ newEventTitle }}</span>
                  <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200" :class="{ 'rotate-180': isTitleDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  v-if="isTitleDropdownOpen"
                  class="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 shadow-xl rounded-[8px] z-[80] py-1.5 overflow-y-auto custom-scroll-hidden"
                  style="max-height: 220px"
                >
                  <div class="px-2 pb-1 mb-1 border-b border-slate-50">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preset Titles</span>
                  </div>
                  <button
                    v-for="(t, ti) in contentTypes"
                    :key="t"
                    type="button"
                    @click="selectTitle(t)"
                    class="w-full text-left px-3 py-2 text-xs font-semibold rounded-[5px] transition-all mx-auto"
                    :style="{ width: 'calc(100% - 8px)' }"
                    :class="[
                      ti === contentTypes.length - 1 ? 'mt-1 border-t border-slate-50 pt-2' : '',
                      newEventTitle === t
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    ]"
                  >
                    {{ t }}
                  </button>
                </div>
                
                <!-- Custom text entry -->
                <input 
                  v-if="isCustomTitle"
                  v-model="customTitleText"
                  type="text" 
                  placeholder="Type custom task title..."
                  class="mt-2 w-full border border-slate-200 rounded-[3px] px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none font-semibold"
                />
              </div>

              <!-- Time Range Input -->
              <div>
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Time Range / Duration</label>
                <input 
                  v-model="newEventTime"
                  type="text" 
                  placeholder="e.g. 09:00 - 09:45 AM"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-blue-300 focus:outline-none transition-colors bg-white font-semibold"
                />
              </div>

              <!-- Custom Popover Date Picker -->
              <div class="relative">
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Date</label>
                <button 
                  @click="isDatePickerOpen = !isDatePickerOpen"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer bg-white font-semibold border-none bg-transparent p-0"
                >
                  <span>{{ formattedNewEventDate }}</span>
                  <IconChevronDown class="w-3.5 h-3.5 opacity-60 text-slate-500" />
                </button>

                <!-- Popover Panel -->
                <div 
                  v-if="isDatePickerOpen" 
                  class="absolute top-full left-0 mt-2 bg-white rounded-[8px] shadow-2xl p-4 z-[80] w-64 text-[#0f172a] border border-slate-100"
                >
                  <!-- Date Picker Navigation Header -->
                  <div class="flex items-center justify-between mb-3 select-none">
                    <button @click="prevPickerMonth" class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
                      <IconChevronLeft class="w-4 h-4" />
                    </button>
                    <span class="text-xs font-bold text-slate-700">{{ pickerMonthYearText }}</span>
                    <button @click="nextPickerMonth" class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
                      <IconChevronRight class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Date Input & Today -->
                  <div class="flex gap-2 mb-3">
                    <input 
                      v-model="tempDatePickerInputText"
                      type="text" 
                      class="flex-1 border border-slate-200 rounded-[5px] px-2 py-1 text-xs text-[#0f172a] focus:border-blue-300 focus:outline-none transition-colors"
                    />
                    <button 
                      @click="setPickerToday"
                      class="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded-[5px] transition-colors cursor-pointer border-none"
                    >
                      Today
                    </button>
                  </div>

                  <!-- Grid headers -->
                  <div class="grid grid-cols-7 text-center text-[9px] font-bold text-slate-400 uppercase mb-1 select-none">
                    <span v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day">{{ day }}</span>
                  </div>

                  <!-- Grid cells -->
                  <div class="grid grid-cols-7 text-center gap-y-1 select-none text-xs font-bold">
                    <button 
                      v-for="cell in pickerDaysInGrid" 
                      :key="cell.key"
                      @click="selectPickerDate(cell.date)"
                      class="w-7 h-7 flex flex-col items-center justify-center rounded-full transition-all relative cursor-pointer border-none"
                      :class="[
                        isPickerDateSelected(cell.date) 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : cell.isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-50',
                      ]"
                    >
                      {{ cell.dayNumber }}
                    </button>
                  </div>

                  <!-- Date picker footer buttons -->
                  <div class="flex justify-end gap-2 border-t border-slate-100 mt-4 pt-3">
                    <button 
                      @click="isDatePickerOpen = false"
                      class="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                    <button 
                      @click="isDatePickerOpen = false"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm cursor-pointer border-none"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <!-- Social Media Platform selection -->
              <div>
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1.5">Task Owner / Category Color</label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="(plat, key) in platforms" 
                    :key="key"
                    @click="newEventPlatform = key"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] border border-slate-200 bg-white text-left hover:bg-slate-50 cursor-pointer select-none transition-all shadow-sm border-none bg-transparent p-0"
                    :class="{ 'border-blue-600 ring-2 ring-blue-600/10': newEventPlatform === key }"
                  >
                    <div class="w-4 h-4 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <img :src="plat.avatar" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-[10px] font-bold text-slate-700 truncate">{{ plat.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button 
                @click="closeModal"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm cursor-pointer border-none"
              >
                Cancel
              </button>
              <button 
                @click="handleAddEvent"
                class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm cursor-pointer border-none"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Event Modal -->
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
          @click="closeModal"
        >
          <!-- background transparent click interceptor to close custom date picker -->
          <div v-if="isDatePickerOpen" class="fixed inset-0 z-[60]" @click="isDatePickerOpen = false"></div>
          
          <div 
            class="bg-white rounded-[5px] shadow-2xl p-5 max-w-sm w-full relative space-y-4 z-[70] animate-fade-in-scale"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-2 select-none">
              <h3 class="text-xs font-bold text-slate-800">Edit Task Event</h3>
              <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
                <IconX class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Content (Form) -->
            <div class="space-y-4 text-left">
              <!-- Content Type Picker -->
              <div class="relative">
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Task / Event Title</label>
                <button
                  type="button"
                  @click.stop="toggleTitleDropdown()"
                  class="w-full border border-slate-200 rounded-[3px] px-2.5 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between hover:border-slate-300 transition-colors"
                >
                  <span class="truncate">{{ newEventTitle }}</span>
                  <svg class="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200" :class="{ 'rotate-180': isTitleDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  v-if="isTitleDropdownOpen"
                  class="absolute left-0 right-0 mt-1.5 bg-white border border-slate-100 shadow-xl rounded-[8px] z-[80] py-1.5 overflow-y-auto custom-scroll-hidden"
                  style="max-height: 220px"
                >
                  <div class="px-2 pb-1 mb-1 border-b border-slate-50">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preset Titles</span>
                  </div>
                  <button
                    v-for="(t, ti) in contentTypes"
                    :key="t"
                    type="button"
                    @click="selectTitle(t)"
                    class="w-full text-left px-3 py-2 text-xs font-semibold rounded-[5px] transition-all mx-auto"
                    :style="{ width: 'calc(100% - 8px)' }"
                    :class="[
                      ti === contentTypes.length - 1 ? 'mt-1 border-t border-slate-50 pt-2' : '',
                      newEventTitle === t
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    ]"
                  >
                    {{ t }}
                  </button>
                </div>
                
                <!-- Custom text entry -->
                <input 
                  v-if="isCustomTitle"
                  v-model="customTitleText"
                  type="text" 
                  placeholder="Type custom task title..."
                  class="mt-2 w-full border border-slate-200 rounded-[3px] px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none font-semibold"
                />
              </div>

              <!-- Time Range Input -->
              <div>
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Time Range / Duration</label>
                <input 
                  v-model="newEventTime"
                  type="text" 
                  placeholder="e.g. 09:00 - 09:45 AM"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-blue-300 focus:outline-none transition-colors bg-white font-semibold"
                />
              </div>

              <!-- Custom Popover Date Picker -->
              <div class="relative">
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1">Date</label>
                <button 
                  @click="isDatePickerOpen = !isDatePickerOpen"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer bg-white font-semibold"
                >
                  <span>{{ formattedNewEventDate }}</span>
                  <IconChevronDown class="w-3.5 h-3.5 opacity-60 text-slate-500" />
                </button>

                <!-- Popover Panel -->
                <div 
                  v-if="isDatePickerOpen" 
                  class="absolute top-full left-0 mt-2 bg-white rounded-[8px] shadow-2xl p-4 z-[80] w-64 text-[#0f172a] border border-slate-100"
                >
                  <!-- Date Picker Navigation Header -->
                  <div class="flex items-center justify-between mb-3 select-none">
                    <button @click="prevPickerMonth" class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
                      <IconChevronLeft class="w-4 h-4" />
                    </button>
                    <span class="text-xs font-bold text-slate-700">{{ pickerMonthYearText }}</span>
                    <button @click="nextPickerMonth" class="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
                      <IconChevronRight class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Date Input & Today -->
                  <div class="flex gap-2 mb-3">
                    <input 
                      v-model="tempDatePickerInputText"
                      type="text" 
                      class="flex-1 border border-slate-200 rounded-[5px] px-2 py-1 text-xs text-[#0f172a] focus:border-blue-300 focus:outline-none transition-colors"
                    />
                    <button 
                      @click="setPickerToday"
                      class="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded-[5px] transition-colors cursor-pointer border-none"
                    >
                      Today
                    </button>
                  </div>

                  <!-- Grid headers -->
                  <div class="grid grid-cols-7 text-center text-[9px] font-bold text-slate-400 uppercase mb-1 select-none">
                    <span v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" :key="day">{{ day }}</span>
                  </div>

                  <!-- Grid cells -->
                  <div class="grid grid-cols-7 text-center gap-y-1 select-none text-xs font-bold">
                    <button 
                      v-for="cell in pickerDaysInGrid" 
                      :key="cell.key"
                      @click="selectPickerDate(cell.date)"
                      class="w-7 h-7 flex flex-col items-center justify-center rounded-full transition-all relative cursor-pointer border-none"
                      :class="[
                        isPickerDateSelected(cell.date) 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : cell.isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-50',
                      ]"
                    >
                      {{ cell.dayNumber }}
                    </button>
                  </div>

                  <!-- Date picker footer buttons -->
                  <div class="flex justify-end gap-2 border-t border-slate-100 mt-4 pt-3">
                    <button 
                      @click="isDatePickerOpen = false"
                      class="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                    <button 
                      @click="isDatePickerOpen = false"
                      class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm cursor-pointer border-none"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              <!-- Social Media Platform selection -->
              <div>
                <label class="block text-[9px] font-bold uppercase text-slate-400 mb-1.5">Task Owner / Category Color</label>
                <div class="grid grid-cols-2 gap-2">
                  <button 
                    v-for="(plat, key) in platforms" 
                    :key="key"
                    @click="newEventPlatform = key"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-[5px] border border-slate-200 bg-white text-left hover:bg-slate-50 cursor-pointer select-none transition-all shadow-sm border-none bg-transparent p-0"
                    :class="{ 'border-blue-600 ring-2 ring-blue-600/10': newEventPlatform === key }"
                  >
                    <div class="w-4 h-4 rounded-full overflow-hidden border border-slate-200 shrink-0">
                      <img :src="plat.avatar" class="w-full h-full object-cover" />
                    </div>
                    <span class="text-[10px] font-bold text-slate-700 truncate">{{ plat.name }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between border-t border-slate-100 pt-3">
              <button 
                @click="handleDeleteEvent"
                class="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[5px] text-xs font-bold text-rose-600 transition-colors cursor-pointer border-none"
              >
                Delete Task
              </button>
              <div class="flex items-center gap-2">
                <button 
                  @click="closeModal"
                  class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  @click="handleEditEvent"
                  class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm cursor-pointer border-none"
                >
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* animations */
.animate-fade-in {
  animation: fadeIn 0.15s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in-scale {
  animation: fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.custom-scroll-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.custom-scroll-hidden::-webkit-scrollbar {
  display: none;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
