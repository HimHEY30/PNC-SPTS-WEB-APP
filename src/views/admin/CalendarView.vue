<script setup lang="ts">
import { ref, computed, inject, type Ref, watch } from 'vue'
import {
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconPlus,
  IconX,
} from '@tabler/icons-vue'

interface CalendarEvent {
  id: string
  title: string
  time: string
  date: string // YYYY-MM-DD
  color: string
  dot?: boolean
  tab: 'all' | 'shared' | 'public' | 'archived'
}

// Base date: Jan 10, 2025
const currentDate = ref(new Date(2025, 0, 10))

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())
const currentDayNumber = computed(() => {
  if (currentYear.value === 2025 && currentMonth.value === 0) {
    return 10
  }
  return currentDate.value.getDate()
})

const tabs = [
  { id: 'all', label: 'All events' },
  { id: 'shared', label: 'Shared' },
  { id: 'public', label: 'Public' },
  { id: 'archived', label: 'Archived' },
]
const activeTab = ref('all')
const localSearchQuery = ref('')

const globalSearchQuery = inject<Ref<string>>('searchQuery', ref(''))
const combinedSearch = computed(() => {
  return globalSearchQuery.value || localSearchQuery.value
})

const weekDays = ['Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const currentMonthAbbr = computed(() => {
  return monthNames[currentMonth.value].substring(0, 3).toUpperCase()
})

const currentMonthYearText = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`
})

const currentMonthRangeText = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const monthName = monthNames[month].substring(0, 3)
  const lastDay = new Date(year, month + 1, 0).getDate()
  return `${monthName} 1, ${year} – ${monthName} ${lastDay}, ${year}`
})

// Navigation
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const goToday = () => {
  currentDate.value = new Date(2025, 0, 10)
}

// Calendar Grid Days Generation
const daysInGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDay = new Date(year, month, 1)
  let startDayOfWeek = firstDay.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

  const totalDays = new Date(year, month + 1, 0).getDate()
  const totalDaysPrevMonth = new Date(year, month, 0).getDate()

  const grid = []

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

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day)
    grid.push({
      date,
      dayNumber: day,
      isCurrentMonth: true,
      key: `curr-${day}`,
    })
  }

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

const isToday = (date: Date) => {
  return (
    date.getFullYear() === 2025 &&
    date.getMonth() === 0 &&
    date.getDate() === 10
  )
}

// Initial Events List matching screenshot
const events = ref<CalendarEvent[]>([
  // Dec 30, 2024
  { id: '1', title: 'Monday standup', time: '9:00 AM', date: '2024-12-30', color: 'gray', tab: 'all' },
  { id: '2', title: 'Coffee with Alina', time: '11:30 AM', date: '2024-12-30', color: 'purple', tab: 'shared' },
  { id: '3', title: 'Marketing site...', time: '2:30 PM', date: '2024-12-30', color: 'blue', tab: 'all' },
  { id: '4', title: 'Design review', time: '4:00 PM', date: '2024-12-30', color: 'blue', tab: 'all' },
  { id: '5', title: 'Code audit', time: '5:30 PM', date: '2024-12-30', color: 'gray', tab: 'all' },
  // Dec 31, 2024
  { id: '6', title: 'Monday standup', time: '9:00 AM', date: '2024-12-31', color: 'gray', tab: 'all' },
  // Jan 2, 2025
  { id: '7', title: 'One-on-one wi...', time: '10:00 AM', date: '2025-01-02', color: 'pink', tab: 'all' },
  { id: '8', title: 'All-hands meeti...', time: '4:00 PM', date: '2025-01-02', color: 'gray', tab: 'all' },
  { id: '9', title: 'Dinner with C...', time: '6:30 PM', date: '2025-01-02', color: 'green', dot: true, tab: 'all' },
  // Jan 3, 2025
  { id: '10', title: 'Friday standup', time: '9:00 AM', date: '2025-01-03', color: 'gray', tab: 'all' },
  // Jan 4, 2025
  { id: '11', title: 'House inspe...', time: '10:30 AM', date: '2025-01-04', color: 'orange', dot: true, tab: 'public' },
  // Jan 6, 2025
  { id: '12', title: 'Monday standup', time: '9:00 AM', date: '2025-01-06', color: 'gray', tab: 'all' },
  { id: '13', title: 'Content planni...', time: '11:00 AM', date: '2025-01-06', color: 'blue', tab: 'all' },
  // Jan 7, 2025
  { id: '14', title: 'One-on-one wi...', time: '10:00 AM', date: '2025-01-07', color: 'pink', tab: 'all' },
  { id: '15', title: 'Catch up w/ Alex', time: '2:30 PM', date: '2025-01-07', color: 'purple', tab: 'all' },
  // Jan 8, 2025
  { id: '16', title: 'Deep work', time: '9:00 AM', date: '2025-01-08', color: 'blue', tab: 'all' },
  { id: '17', title: 'Design sync', time: '10:30 AM', date: '2025-01-08', color: 'blue', tab: 'all' },
  { id: '18', title: 'SEO planning', time: '1:30 PM', date: '2025-01-08', color: 'blue', tab: 'all' },
  { id: '19', title: 'Analytics sync', time: '3:00 PM', date: '2025-01-08', color: 'gray', tab: 'all' },
  { id: '20', title: 'QA testing', time: '4:15 PM', date: '2025-01-08', color: 'gray', tab: 'all' },
  // Jan 9, 2025
  { id: '21', title: 'Lunch with...', time: '12:00 PM', date: '2025-01-09', color: 'green', dot: true, tab: 'all' },
  // Jan 10, 2025
  { id: '22', title: 'Friday standup', time: '9:00 AM', date: '2025-01-10', color: 'gray', tab: 'all' },
  { id: '23', title: 'Olivia x Riley', time: '10:00 AM', date: '2025-01-10', color: 'purple', tab: 'shared' },
  { id: '24', title: 'Product demo', time: '1:30 PM', date: '2025-01-10', color: 'blue', tab: 'all' },
  // Jan 11, 2025
  { id: '25', title: 'House inspe...', time: '11:00 AM', date: '2025-01-11', color: 'orange', dot: true, tab: 'public' },
  // Jan 12, 2025
  { id: '26', title: 'Ava\'s engagm...', time: '1:00 PM', date: '2025-01-12', color: 'purple', dot: true, tab: 'shared' },
  // Jan 13, 2025
  { id: '27', title: 'Monday standup', time: '9:00 AM', date: '2025-01-13', color: 'gray', tab: 'all' },
  { id: '28', title: 'Team lunch', time: '12:15 PM', date: '2025-01-13', color: 'pink', tab: 'all' },
  // Jan 15, 2025
  { id: '29', title: 'Product planning', time: '9:30 AM', date: '2025-01-15', color: 'blue', tab: 'all' },
  // Jan 16, 2025
  { id: '30', title: 'Amélie\'s first...', time: '10:00 AM', date: '2025-01-16', color: 'pink', tab: 'all' },
  { id: '31', title: 'All-hands meeti...', time: '4:00 PM', date: '2025-01-16', color: 'gray', tab: 'all' },
  // Jan 17, 2025
  { id: '32', title: 'Friday standup', time: '9:00 AM', date: '2025-01-17', color: 'gray', tab: 'all' },
  { id: '33', title: 'Coffee w/ Amélie', time: '9:30 AM', date: '2025-01-17', color: 'purple', tab: 'shared' },
  { id: '34', title: 'Design feedbac...', time: '2:30 PM', date: '2025-01-17', color: 'blue', tab: 'all' },
  { id: '35', title: 'Review details', time: '4:00 PM', date: '2025-01-17', color: 'gray', tab: 'all' },
  // Jan 18, 2025
  { id: '36', title: 'Half maratho...', time: '7:00 AM', date: '2025-01-18', color: 'green', dot: true, tab: 'public' },
  // Jan 20, 2025
  { id: '37', title: 'Monday standup', time: '9:00 AM', date: '2025-01-20', color: 'gray', tab: 'all' },
  { id: '38', title: 'Deep work', time: '9:15 AM', date: '2025-01-20', color: 'blue', tab: 'all' },
  // Jan 21, 2025
  { id: '39', title: 'Quarterly review', time: '11:30 AM', date: '2025-01-21', color: 'orange', tab: 'all' },
  { id: '40', title: 'Lunch with Zahir', time: '1:00 PM', date: '2025-01-21', color: 'green', dot: true, tab: 'all' },
  { id: '41', title: 'Dinner with C...', time: '7:00 PM', date: '2025-01-21', color: 'green', dot: true, tab: 'all' },
  // Jan 22, 2025
  { id: '42', title: 'Deep work', time: '9:00 AM', date: '2025-01-22', color: 'blue', tab: 'all' },
  { id: '43', title: 'Design sync', time: '2:30 PM', date: '2025-01-22', color: 'blue', tab: 'all' },
  // Jan 23, 2025
  { id: '44', title: 'Amélie coffee', time: '10:00 AM', date: '2025-01-23', color: 'pink', tab: 'all' },
  // Jan 24, 2025
  { id: '45', title: 'Friday standup', time: '9:00 AM', date: '2025-01-24', color: 'gray', tab: 'all' },
  { id: '46', title: 'Accountant', time: '1:45 PM', date: '2025-01-24', color: 'yellow', tab: 'all' },
  { id: '47', title: 'Marketing site...', time: '2:30 PM', date: '2025-01-24', color: 'blue', tab: 'all' },
  { id: '48', title: 'Billing check', time: '3:30 PM', date: '2025-01-24', color: 'gray', tab: 'all' },
  // Jan 28, 2025
  { id: '49', title: 'Content planni...', time: '11:00 AM', date: '2025-01-28', color: 'blue', tab: 'all' },
  { id: '50', title: 'Lunch with Alina', time: '12:45 PM', date: '2025-01-28', color: 'purple', tab: 'shared' },
  // Jan 29, 2025
  { id: '51', title: 'Product planning', time: '9:30 AM', date: '2025-01-29', color: 'blue', tab: 'all' },
  // Jan 30, 2025
  { id: '52', title: 'All-hands meeti...', time: '4:00 PM', date: '2025-01-30', color: 'gray', tab: 'all' },
  { id: '53', title: 'Team dinner', time: '5:30 PM', date: '2025-01-30', color: 'pink', tab: 'all' },
  // Jan 31, 2025
  { id: '54', title: 'Friday standup', time: '8:00 AM', date: '2025-01-31', color: 'gray', tab: 'all' },
  // Feb 2, 2025
  { id: '55', title: 'Monday standup', time: '9:00 AM', date: '2025-02-02', color: 'gray', tab: 'all' },
])

const getEventsForDate = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const dateStr = `${yyyy}-${mm}-${dd}`

  let list = events.value.filter(e => e.date === dateStr)

  if (activeTab.value !== 'all') {
    list = list.filter(e => e.tab === activeTab.value)
  }

  if (combinedSearch.value.trim()) {
    const q = combinedSearch.value.toLowerCase().trim()
    list = list.filter(e => e.title.toLowerCase().includes(q))
  }

  return list
}

const getEventColorClass = (color: string) => {
  switch (color) {
    case 'purple': return 'bg-[#faf5ff] text-[#7c3aed] border-purple-100/50'
    case 'blue': return 'bg-[#eff6ff] text-[#1d4ed8] border-blue-100/50'
    case 'green': return 'bg-[#ecfdf5] text-[#047857] border-emerald-100/50'
    case 'orange': return 'bg-[#fff7ed] text-[#c2410c] border-orange-100/50'
    case 'pink': return 'bg-[#fff1f2] text-[#be185d] border-rose-100/50'
    case 'yellow': return 'bg-[#fefce8] text-[#a16207] border-yellow-100/50'
    case 'gray':
    default:
      return 'bg-[#f8fafc] text-[#475569] border-slate-100/50'
  }
}

const getEventDotClass = (color: string) => {
  switch (color) {
    case 'purple': return 'bg-[#7c3aed]'
    case 'blue': return 'bg-[#3b82f6]'
    case 'green': return 'bg-[#10b981]'
    case 'orange': return 'bg-[#f97316]'
    case 'pink': return 'bg-[#f43f5e]'
    case 'yellow': return 'bg-[#eab308]'
    case 'gray':
    default:
      return 'bg-[#64748b]'
  }
}

// Add Event Modal Controls
const showAddModal = ref(false)
const newEventTitle = ref('')
const newEventDate = ref('2025-01-10')
const newEventTime = ref('9:00 AM')
const newEventColor = ref('blue')
const newEventTab = ref<'all' | 'shared' | 'public' | 'archived'>('all')
const newEventDot = ref(false)

// Custom Date Picker Panel State (matching Screenshot 2)
const isDatePickerOpen = ref(false)
const pickerActiveDate = ref(new Date(2025, 0, 10)) // Internal navigation date
const tempDatePickerInputText = ref('Jan 10, 2025')

// Custom Visibility Dropdown State
const isTabDropdownOpen = ref(false)

const getTabLabel = (tab: string) => {
  switch (tab) {
    case 'all': return 'All Events'
    case 'shared': return 'Shared'
    case 'public': return 'Public'
    case 'archived': return 'Archived'
    default: return 'All Events'
  }
}

const selectTabOption = (tab: 'all' | 'shared' | 'public' | 'archived') => {
  newEventTab.value = tab
  isTabDropdownOpen.value = false
}

const formattedNewEventDate = computed(() => {
  const parts = newEventDate.value.split('-')
  if (parts.length !== 3) return ''
  const y = parseInt(parts[0])
  const m = parseInt(parts[1]) - 1
  const d = parseInt(parts[2])
  const dateObj = new Date(y, m, d)
  return `${monthNames[dateObj.getMonth()].substring(0, 3)} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
})

// Sync text input with the date selection in date picker
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

// Date Picker Month/Year display
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
  pickerActiveDate.value = new Date(2025, 0, 10) // Lock to Jan 10, 2025 as today
  selectPickerDate(new Date(2025, 0, 10))
}

const selectPickerDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  newEventDate.value = `${y}-${m}-${d}`
}

const isPickerDateSelected = (date: Date) => {
  const parts = newEventDate.value.split('-')
  if (parts.length !== 3) return false
  return (
    date.getFullYear() === parseInt(parts[0]) &&
    date.getMonth() === parseInt(parts[1]) - 1 &&
    date.getDate() === parseInt(parts[2])
  )
}

const isPickerDateHovered = (date: Date) => {
  // E.g. Jan 24, 2025 is hovered in the mockup screenshot.
  return (
    date.getFullYear() === 2025 &&
    date.getMonth() === 0 &&
    date.getDate() === 24
  )
}

const hasEvents = (date: Date) => {
  // Check if date has events for dot indicator
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const dateStr = `${yyyy}-${mm}-${dd}`
  return events.value.some(e => e.date === dateStr)
}

// Generate cells for date picker grid starting on Mon
const pickerDaysInGrid = computed(() => {
  const year = pickerActiveDate.value.getFullYear()
  const month = pickerActiveDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  let startDayOfWeek = firstDay.getDay()
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

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

const parseDatePickerInput = () => {
  const val = tempDatePickerInputText.value.trim()
  const d = new Date(val)
  if (!isNaN(d.getTime())) {
    selectPickerDate(d)
  }
}

const applyPickerDate = () => {
  isDatePickerOpen.value = false
}

const openAddEventModal = (date: Date | null) => {
  newEventTitle.value = ''
  newEventTime.value = '9:00 AM'
  newEventColor.value = 'blue'
  newEventTab.value = 'all'
  newEventDot.value = false
  isDatePickerOpen.value = false
  isTabDropdownOpen.value = false

  if (date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    newEventDate.value = `${y}-${m}-${d}`
  } else {
    newEventDate.value = '2025-01-10'
  }
  showAddModal.value = true
}

const handleAddEvent = () => {
  if (!newEventTitle.value.trim() || !newEventDate.value) return

  events.value.push({
    id: String(Date.now()),
    title: newEventTitle.value.trim(),
    time: newEventTime.value.trim() || 'All Day',
    date: newEventDate.value,
    color: newEventColor.value,
    dot: newEventDot.value,
    tab: newEventTab.value,
  })

  showAddModal.value = false
}

// Day view sub-modal
const selectedDayForView = ref<Date | null>(null)
const showViewAllModal = ref(false)

const viewAllEventsForDate = (date: Date) => {
  selectedDayForView.value = date
  showViewAllModal.value = true
}

const selectedDayFormatted = computed(() => {
  if (!selectedDayForView.value) return ''
  const d = selectedDayForView.value
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
})
</script>

<template>
  <div class="space-y-6 text-left max-w-[1600px] mx-auto pb-10 relative">
    
    <!-- Top Header Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-base font-bold text-[#0f172a]">Calendar</h1>
        
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 mt-3 select-none">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-3 py-1.5 text-xs font-bold rounded-[5px] transition-all"
            :class="activeTab === tab.id 
              ? 'bg-slate-200 text-slate-800' 
              : 'text-[#64748b] hover:bg-slate-100 hover:text-slate-700'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <!-- Search Input -->
      <div class="relative w-full md:w-64">
        <input 
          v-model="localSearchQuery"
          type="text" 
          placeholder="Search"
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-12 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 bg-white select-none">
          ⌘K
        </span>
      </div>
    </div>

    <!-- Calendar Container Card -->
    <div class="bg-white rounded-[5px] border border-slate-100 p-4 shadow-md space-y-4">
      
      <!-- Calendar Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        
        <!-- Date Display Block -->
        <div class="flex items-center gap-3">
          <div class="bg-slate-50 border border-slate-100 rounded-[5px] p-2 flex flex-col items-center justify-center min-w-[50px] shadow-sm select-none">
            <span class="text-[9px] font-bold text-rose-500 uppercase tracking-widest leading-none">
              {{ currentMonthAbbr }}
            </span>
                    <span class="text-xs font-bold text-[#0f172a] mt-1 leading-none">
              {{ currentDayNumber }}
            </span>
          </div>
          <div class="text-left leading-none">
            <h2 class="text-sm font-bold text-[#0f172a]">{{ currentMonthYearText }}</h2>
            <p class="text-[11px] font-bold text-slate-400 mt-1.5">{{ currentMonthRangeText }}</p>
          </div>
        </div>

        <!-- Navigation & Actions -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Search Icon Button -->
          <button class="w-8 h-8 rounded-[5px] border border-slate-200 bg-white flex items-center justify-center text-[#94a3b8] hover:bg-slate-50 transition-colors">
            <IconSearch class="w-4 h-4" />
          </button>

          <!-- Navigation buttons group -->
          <div class="flex bg-white border border-slate-200 rounded-[5px] shadow-sm p-0.5">
            <button 
              @click="prevMonth"
              class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[3px] transition-colors"
            >
              <IconChevronLeft class="w-4 h-4" />
            </button>
            <button 
              @click="goToday"
              class="px-3 h-7 flex items-center justify-center text-xs font-bold text-slate-700 hover:text-slate-800 hover:bg-slate-50 rounded-[3px] transition-colors border-x border-slate-100"
            >
              Today
            </button>
            <button 
              @click="nextMonth"
              class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[3px] transition-colors"
            >
              <IconChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- View Selector Dropdown -->
          <button class="px-3 py-1.5 rounded-[5px] border border-slate-200 bg-white flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm select-none">
            Month view
            <IconChevronDown class="w-3.5 h-3.5 opacity-60 text-slate-500" />
          </button>

          <!-- Add Event Button -->
          <button 
            @click="openAddEventModal(null)"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
          >
            <IconPlus class="w-3.5 h-3.5" />
            Add event
          </button>
        </div>
      </div>

      <!-- Calendar Grid Layout -->
      <div class="border border-slate-100 rounded-[5px] overflow-hidden shadow-sm">
        
        <!-- Grid Header (Days of week) -->
        <div class="grid grid-cols-7 bg-slate-50 border-b border-slate-100 text-center py-2 select-none">
          <span v-for="day in weekDays" :key="day" class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {{ day }}
          </span>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/50">
          <div 
            v-for="cell in daysInGrid" 
            :key="cell.key"
            class="min-h-[120px] bg-white p-2 flex flex-col justify-between hover:bg-slate-50/20 transition-all group"
            :class="{ 'opacity-50 bg-slate-50/10': !cell.isCurrentMonth }"
          >
            <!-- Day number & Actions -->
            <div class="flex items-center justify-between mb-1">
              <span 
                class="text-xs font-bold w-6 h-6 flex items-center justify-center"
                :class="isToday(cell.date) 
                  ? 'bg-slate-900 text-white rounded-full' 
                  : cell.isCurrentMonth ? 'text-[#0f172a]' : 'text-slate-300'"
              >
                {{ cell.dayNumber }}
              </span>
              
              <!-- Quick Add event on hover -->
              <button 
                @click="openAddEventModal(cell.date)"
                class="w-5 h-5 rounded-[3px] bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <IconPlus class="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Day Events List -->
            <div class="flex-1 space-y-1 overflow-y-auto no-scrollbar">
              <div 
                v-for="event in getEventsForDate(cell.date).slice(0, 3)" 
                :key="event.id"
                class="text-[10px] py-1 px-1.5 rounded-[4px] font-semibold flex items-center justify-between gap-1 shadow-sm border border-transparent select-none cursor-pointer"
                :class="getEventColorClass(event.color)"
              >
                <div class="flex items-center gap-1 min-w-0">
                  <span v-if="event.dot" class="w-1.5 h-1.5 rounded-full shrink-0" :class="getEventDotClass(event.color)"></span>
                  <span class="truncate">{{ event.title }}</span>
                </div>
                <span class="text-[9px] opacity-60 font-medium shrink-0">{{ event.time }}</span>
              </div>
              
              <!-- More Events Link -->
              <button 
                v-if="getEventsForDate(cell.date).length > 3"
                @click="viewAllEventsForDate(cell.date)"
                class="text-[9px] font-bold text-indigo-600 hover:text-indigo-800 block mt-1 transition-colors pl-1"
              >
                + {{ getEventsForDate(cell.date).length - 3 }} more...
              </button>
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
          @click="showAddModal = false"
        >
          <!-- Background transparent clicks interceptor to dismiss dropdowns -->
          <div v-if="isDatePickerOpen" class="fixed inset-0 z-[60]" @click="isDatePickerOpen = false"></div>
          <div v-if="isTabDropdownOpen" class="fixed inset-0 z-[60]" @click="isTabDropdownOpen = false"></div>

          <div 
            class="bg-white rounded-[5px] shadow-2xl p-6 max-w-md w-full relative space-y-4 z-[70]"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 class="text-xs font-bold text-[#0f172a]">Add New Event</h3>
              <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
                <IconX class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Content (Form) -->
            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Event Title</label>
                <input 
                  v-model="newEventTitle"
                  type="text" 
                  placeholder="e.g. Project planning"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <!-- Custom Popover Date Picker (matching Screenshot 2) -->
                <div class="relative">
                  <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date</label>
                  <button 
                    @click="isDatePickerOpen = !isDatePickerOpen; isTabDropdownOpen = false"
                    class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span>{{ formattedNewEventDate }}</span>
                    <IconChevronDown class="w-3.5 h-3.5 opacity-60 text-slate-500" />
                  </button>

                  <!-- Popover Panel -->
                  <div 
                    v-if="isDatePickerOpen" 
                    class="absolute top-full left-0 mt-2 bg-white rounded-[8px] shadow-2xl p-4 z-[80] w-64 text-[#0f172a]"
                  >
                    <!-- Date Picker Navigation Header -->
                    <div class="flex items-center justify-between mb-3 select-none">
                      <button @click="prevPickerMonth" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <IconChevronLeft class="w-4 h-4" />
                      </button>
                      <span class="text-xs font-bold text-slate-700">{{ pickerMonthYearText }}</span>
                      <button @click="nextPickerMonth" class="text-slate-400 hover:text-slate-600 transition-colors">
                        <IconChevronRight class="w-4 h-4" />
                      </button>
                    </div>

                    <!-- Date Input & Today -->
                    <div class="flex gap-2 mb-3">
                      <input 
                        v-model="tempDatePickerInputText"
                        type="text" 
                        class="flex-1 border border-slate-200 rounded-[5px] px-2.5 py-1 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                        @blur="parseDatePickerInput"
                      />
                      <button 
                        @click="setPickerToday"
                        class="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 rounded-[5px] transition-colors"
                      >
                        Today
                      </button>
                    </div>

                    <!-- Date picker calendar grid headers -->
                    <div class="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 select-none">
                      <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day">{{ day }}</span>
                    </div>

                    <!-- Date picker calendar cells -->
                    <div class="grid grid-cols-7 text-center gap-y-1 select-none text-xs font-bold">
                      <button 
                        v-for="cell in pickerDaysInGrid" 
                        :key="cell.key"
                        @click="selectPickerDate(cell.date)"
                        class="w-7 h-7 flex flex-col items-center justify-center rounded-full transition-all relative"
                        :class="[
                          isPickerDateSelected(cell.date) 
                            ? 'bg-[#7c3aed] text-white hover:bg-[#6d28d9]' 
                            : isPickerDateHovered(cell.date)
                              ? 'bg-indigo-50 text-[#7c3aed]'
                              : cell.isCurrentMonth ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-50',
                        ]"
                      >
                        {{ cell.dayNumber }}
                        <!-- dot if date has events -->
                        <span 
                          v-if="hasEvents(cell.date)" 
                          class="w-1.5 h-1.5 rounded-full absolute bottom-0.5 animate-pulse"
                          :class="isPickerDateSelected(cell.date) ? 'bg-white' : 'bg-[#7c3aed]'"
                        ></span>
                      </button>
                    </div>

                    <!-- Date picker footer buttons -->
                    <div class="flex justify-end gap-2 border-t border-slate-50 mt-4 pt-3">
                      <button 
                        @click="isDatePickerOpen = false"
                        class="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        @click="applyPickerDate"
                        class="px-3 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Time</label>
                  <input 
                    v-model="newEventTime"
                    type="text" 
                  placeholder="e.g. 9:30 AM"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <!-- Custom Visibility Tab Dropdown (matching Screenshot 1 style single-select) -->
              <div class="relative">
                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Visibility Tab</label>
                <!-- Trigger Button -->
                <button 
                  @click="isTabDropdownOpen = !isTabDropdownOpen; isDatePickerOpen = false"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                  :class="isTabDropdownOpen ? 'border-purple-300 ring-2 ring-purple-100' : ''"
                >
                  <span>{{ getTabLabel(newEventTab) }}</span>
                  <IconChevronDown class="w-3.5 h-3.5 opacity-60 text-slate-500" />
                </button>

                <!-- Dropdown Menu Panel -->
                <div 
                  v-if="isTabDropdownOpen" 
                  class="absolute top-full left-0 mt-1.5 w-full bg-white rounded-[8px] shadow-2xl z-[80] text-[#0f172a] flex flex-col overflow-hidden"
                >
                  <div class="py-1">
                    <div 
                      v-for="opt in ['all', 'shared', 'public', 'archived']" 
                      :key="opt"
                      @click="selectTabOption(opt as any)"
                      class="px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 cursor-pointer select-none"
                    >
                      <!-- Custom checkbox style showing checkmark if active -->
                      <div 
                        class="w-4.5 h-4.5 rounded-[4px] flex items-center justify-center border transition-all"
                        :class="newEventTab === opt ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-slate-300 bg-white'"
                      >
                        <span v-if="newEventTab === opt" class="text-[10px] font-bold">✓</span>
                      </div>
                      <span class="text-xs font-bold text-slate-700">{{ getTabLabel(opt) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Color Theme</label>
                <div class="flex gap-2">
                  <button 
                    v-for="color in ['gray', 'purple', 'blue', 'green', 'orange', 'pink', 'yellow']" 
                    :key="color"
                    @click="newEventColor = color"
                    class="w-6 h-6 rounded-full border flex items-center justify-center transition-all"
                    :class="[
                      newEventColor === color ? 'border-slate-800 scale-110 shadow-sm' : 'border-transparent opacity-80',
                      getEventDotClass(color)
                    ]"
                  ></button>
                </div>
              </div>

              <!-- Custom Checkbox for Add bullet/dot (matching Screenshot 1 checkbox styling) -->
              <div class="pt-1">
                <button 
                  @click="newEventDot = !newEventDot"
                  class="flex items-center gap-2.5 text-xs font-bold text-slate-600 select-none cursor-pointer outline-none"
                >
                  <div 
                    class="w-4.5 h-4.5 rounded-[4px] flex items-center justify-center border transition-all shrink-0 animate-in duration-150"
                    :class="newEventDot ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'border-slate-300 bg-white'"
                  >
                    <span v-if="newEventDot" class="text-[10px] font-bold">✓</span>
                  </div>
                  <span>Add bullet/dot</span>
                </button>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-end gap-2 border-t border-slate-50 pt-3">
              <button 
                @click="showAddModal = false"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                @click="handleAddEvent"
                class="px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- View All Events sub-modal -->
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
          v-if="showViewAllModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click="showViewAllModal = false"
        >
          <div 
            class="bg-white rounded-[5px] shadow-2xl p-6 max-w-sm w-full relative space-y-4 animate-in fade-in zoom-in duration-200"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 class="text-xs font-bold text-[#0f172a]">
                Events for {{ selectedDayFormatted }}
              </h3>
              <button @click="showViewAllModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
                <IconX class="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Content -->
            <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div 
                v-for="event in (selectedDayForView ? getEventsForDate(selectedDayForView) : [])" 
                :key="event.id"
                class="text-xs py-2 px-3 rounded-[5px] font-bold flex items-center justify-between gap-2 border select-none"
                :class="getEventColorClass(event.color)"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span v-if="event.dot" class="w-2 h-2 rounded-full shrink-0" :class="getEventDotClass(event.color)"></span>
                  <span class="truncate">{{ event.title }}</span>
                </div>
                <span class="text-xs opacity-60 font-semibold shrink-0">{{ event.time }}</span>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex justify-between items-center border-t border-slate-50 pt-3">
              <button 
                @click="openAddEventModal(selectedDayForView); showViewAllModal = false"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
              >
                <IconPlus class="w-3.5 h-3.5" /> Add Event
              </button>
              <button 
                @click="showViewAllModal = false"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Hide scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
