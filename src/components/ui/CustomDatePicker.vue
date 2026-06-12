<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { IconCalendar } from '@tabler/icons-vue'

const props = defineProps<{
  modelValue: string | null
  placeholder?: string
  id?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)

// Custom dropdowns states
const isMonthDropdownOpen = ref(false)
const isYearDropdownOpen = ref(false)

// Current date state
const selectedDate = ref<Date | null>(null)

// Views year and month (for navigating calendar)
const currentViewYear = ref(new Date().getFullYear())
const currentViewMonth = ref(new Date().getMonth()) // 0-indexed

// Dynamic popover style
const dropdownStyle = ref<Record<string, string>>({})

// Initialize from props
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const d = new Date(newVal)
    if (!isNaN(d.getTime())) {
      selectedDate.value = d
      currentViewYear.value = d.getUTCFullYear()
      currentViewMonth.value = d.getUTCMonth()
      return
    }
  }
  selectedDate.value = null
}, { immediate: true })

// Helper constants
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const WEEK_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const yearsList = computed(() => {
  const currentYear = new Date().getFullYear()
  const list = []
  // Show years from 1980 to current year + 5
  for (let y = 1980; y <= currentYear + 5; y++) {
    list.push(y)
  }
  return list
})

// Current day number display (top right orange calendar day)
const displayDay = computed(() => {
  if (selectedDate.value) {
    return String(selectedDate.value.getUTCDate()).padStart(2, '0')
  }
  return String(new Date().getDate()).padStart(2, '0')
})

// Generate calendar days grid
const calendarDays = computed(() => {
  const year = currentViewYear.value
  const month = currentViewMonth.value

  const firstDayIndex = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const daysInPrevMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  const grid = []

  // Prev month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    grid.push({
      date: daysInPrevMonth - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    grid.push({
      date: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    })
  }

  // Next month leading days
  const totalDaysSoFar = grid.length
  const remainingSlots = totalDaysSoFar % 7 === 0 ? 0 : 7 - (totalDaysSoFar % 7)
  for (let i = 1; i <= remainingSlots; i++) {
    grid.push({
      date: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    })
  }

  return grid
})

const formattedInputDate = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  })
})

function toggleOpen() {
  isOpen.value = !isOpen.value
  isMonthDropdownOpen.value = false
  isYearDropdownOpen.value = false
  if (isOpen.value && selectedDate.value) {
    currentViewYear.value = selectedDate.value.getUTCFullYear()
    currentViewMonth.value = selectedDate.value.getUTCMonth()
  }
}

function selectDay(day: { date: number; month: number; year: number }) {
  // Create Date object in UTC to prevent timezone offsets shifting it
  const d = new Date(Date.UTC(day.year, day.month, day.date))
  selectedDate.value = d
}

function isSelectedDay(day: { date: number; month: number; year: number }) {
  if (!selectedDate.value) return false
  return selectedDate.value.getUTCDate() === day.date &&
         selectedDate.value.getUTCMonth() === day.month &&
         selectedDate.value.getUTCFullYear() === day.year
}

function confirmSelection() {
  if (selectedDate.value) {
    const yyyy = selectedDate.value.getUTCFullYear()
    const mm = String(selectedDate.value.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(selectedDate.value.getUTCDate()).padStart(2, '0')
    emit('update:modelValue', `${yyyy}-${mm}-${dd}`)
  } else {
    emit('update:modelValue', null)
  }
  isOpen.value = false
  isMonthDropdownOpen.value = false
  isYearDropdownOpen.value = false
}

// Click outside handler
function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (target && !target.isConnected) return

  const clickedInsideTrigger = containerRef.value && containerRef.value.contains(target)
  const clickedInsidePopover = popoverRef.value && popoverRef.value.contains(target)

  if (!clickedInsideTrigger && !clickedInsidePopover) {
    isOpen.value = false
    isMonthDropdownOpen.value = false
    isYearDropdownOpen.value = false
  }
}

// Calculate popover coordinates and handle edge overflows
function updatePosition() {
  if (!isOpen.value || !containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const popoverWidth = 285
  // Measure the popup height dynamically if rendered, default to 280px
  const popoverHeight = popoverRef.value ? popoverRef.value.offsetHeight : 280

  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top

  let top = rect.bottom + window.scrollY + 6

  // If calendar overflows viewport bottom and there is more space above, open upwards instead
  if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
    top = rect.top + window.scrollY - popoverHeight - 6
  }

  const left = rect.right - popoverWidth + window.scrollX

  // Prevent off-screen positioning on small viewports
  const finalLeft = Math.max(12, left)

  dropdownStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${finalLeft}px`
  }
}

function toggleMonthDropdown() {
  isMonthDropdownOpen.value = !isMonthDropdownOpen.value
  isYearDropdownOpen.value = false
}

function toggleYearDropdown() {
  isYearDropdownOpen.value = !isYearDropdownOpen.value
  isMonthDropdownOpen.value = false
}

function selectMonth(idx: number) {
  currentViewMonth.value = idx
  isMonthDropdownOpen.value = false
}

function selectYear(year: number) {
  currentViewYear.value = year
  isYearDropdownOpen.value = false
}

// Scroll active items into view when sub-dropdowns open
watch(isMonthDropdownOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    const activeEl = popoverRef.value?.querySelector('.active-month')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }
})

watch(isYearDropdownOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    const activeEl = popoverRef.value?.querySelector('.active-year')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }
})

// Track popup open/close state
watch(isOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    updatePosition()
    window.addEventListener('resize', updatePosition)
    // capture: true intercepts scrolling in nested elements like modals
    window.addEventListener('scroll', updatePosition, true)
  } else {
    isMonthDropdownOpen.value = false
    isYearDropdownOpen.value = false
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition, true)
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
})

const getDayClass = (day: { date: number; month: number; year: number; isCurrentMonth: boolean }, idx: number) => {
  if (!day.isCurrentMonth) {
    return 'text-[#cbd5e1]'
  }
  if (isSelectedDay(day)) {
    return 'text-[#ff9c07]'
  }
  if (idx % 7 === 0) {
    return 'text-[#ff9c07]'
  }
  return 'text-[#1e293b]'
}
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <!-- Display input text field -->
    <div class="relative">
      <input
        :id="id"
        type="text"
        readonly
        :placeholder="placeholder || 'Select date...'"
        :value="formattedInputDate"
        @click="toggleOpen"
        class="w-full rounded-[3px] border border-slate-200 pl-3 pr-8 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 bg-white cursor-pointer select-none"
      />
      <IconCalendar 
        class="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" 
      />
    </div>

    <!-- Teleport the Date Picker Card Overlay to body -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popoverRef"
        :style="dropdownStyle"
        class="bg-white border border-slate-100/50 shadow-[0_10px_25px_rgba(0,0,0,0.1)] rounded-[20px] p-4 w-[285px] z-[9999] animate-in fade-in slide-in-from-top-1 duration-150 text-left select-none"
      >
        <!-- Title & Icon Header Row -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="text-[17px] font-black text-[#1e293b] tracking-tight leading-none">Select Date</h4>
            
            <!-- Month/Year selectors -->
            <div class="flex items-center gap-1.5 mt-2.5">
              <!-- Month Dropdown -->
              <div class="relative inline-block">
                <button
                  type="button"
                  @click.stop="toggleMonthDropdown"
                  class="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-800 text-[10px] font-bold px-2.5 py-1 pr-6 rounded-[8px] outline-none cursor-pointer transition-colors flex items-center justify-between min-w-[75px] text-left"
                >
                  <span>{{ MONTH_NAMES[currentViewMonth] }}</span>
                  <svg class="w-2.5 h-2.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Custom Scrollable Month List (No Scrollbar) -->
                <div
                  v-if="isMonthDropdownOpen"
                  class="absolute left-0 mt-1 w-[100px] max-h-[140px] overflow-y-auto bg-white border border-slate-100 shadow-lg rounded-[8px] z-[10000] py-1 custom-scroll-hidden"
                >
                  <button
                    v-for="(name, idx) in MONTH_NAMES"
                    :key="name"
                    type="button"
                    @click="selectMonth(idx)"
                    class="w-full text-left px-3 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors"
                    :class="{ 'text-[#ff9c07] bg-slate-50/50 active-month': currentViewMonth === idx }"
                  >
                    {{ name }}
                  </button>
                </div>
              </div>

              <!-- Year Dropdown -->
              <div class="relative inline-block">
                <button
                  type="button"
                  @click.stop="toggleYearDropdown"
                  class="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-slate-800 text-[10px] font-bold px-2.5 py-1 pr-6 rounded-[8px] outline-none cursor-pointer transition-colors flex items-center justify-between min-w-[65px] text-left"
                >
                  <span>{{ currentViewYear }}</span>
                  <svg class="w-2.5 h-2.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Custom Scrollable Year List (No Scrollbar) -->
                <div
                  v-if="isYearDropdownOpen"
                  class="absolute left-0 mt-1 w-[80px] max-h-[140px] overflow-y-auto bg-white border border-slate-100 shadow-lg rounded-[8px] z-[10000] py-1 custom-scroll-hidden"
                >
                  <button
                    v-for="y in yearsList"
                    :key="y"
                    type="button"
                    @click="selectYear(y)"
                    class="w-full text-left px-3 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors"
                    :class="{ 'text-[#ff9c07] bg-slate-50/50 active-year': currentViewYear === y }"
                  >
                    {{ y }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Orange calendar badge (as in screenshot) -->
          <div class="relative w-11 h-11 bg-[#ff9c07] rounded-[10px] flex items-center justify-center shadow-[0_3px_8px_rgba(255,156,7,0.2)] select-none shrink-0 border border-[#ff9c07]/20">
            <!-- Spiral binding rings -->
            <span class="absolute -top-1 left-[11px] w-0.5 h-2.5 bg-[#e65c00] rounded-full"></span>
            <span class="absolute -top-1 right-[11px] w-0.5 h-2.5 bg-[#e65c00] rounded-full"></span>
            <!-- Selected Day -->
            <span class="text-white font-black text-lg leading-none mt-0.5 select-none">{{ displayDay }}</span>
          </div>
        </div>

        <!-- Weekdays Grid -->
        <div class="grid grid-cols-7 gap-y-1 text-center text-[9px] font-bold mb-2">
          <span
            v-for="(day, idx) in WEEK_DAYS"
            :key="day"
            :class="idx === 0 ? 'text-[#ff9c07]' : 'text-[#475569]'"
          >
            {{ day }}
          </span>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 gap-y-0.5 text-center">
          <button
            v-for="(day, idx) in calendarDays"
            :key="idx"
            type="button"
            @click="selectDay(day)"
            :class="[
              'text-[10px] py-0.5 font-bold relative focus:outline-none flex flex-col items-center justify-center rounded-[6px] transition-all hover:bg-slate-50 h-[25px] w-full',
              getDayClass(day, idx)
            ]"
          >
            <span>{{ String(day.date).padStart(2, '0') }}</span>
            
            <!-- Selected day underline style -->
            <span
              v-if="isSelectedDay(day)"
              class="absolute bottom-0.5 w-[10px] h-[1.5px] bg-[#ff9c07] rounded-full"
            ></span>
          </button>
        </div>

        <!-- Confirm Button -->
        <button
          type="button"
          @click="confirmSelection"
          class="w-full bg-[#ff9c07] hover:bg-[#e68a00] text-white text-[11px] font-bold py-2 rounded-[3px] shadow-[0_3px_8px_rgba(255,156,7,0.15)] transition-all duration-200 w-full mt-4 flex justify-center items-center cursor-pointer select-none"
        >
          Confirm
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Scoped utility to hide scrollbars while preserving scrolling ability */
.custom-scroll-hidden {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.custom-scroll-hidden::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, and Opera */
}
</style>
