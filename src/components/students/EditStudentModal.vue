<script setup lang="ts">
import { ref, watch } from 'vue'
import CustomDatePicker from '@/components/ui/CustomDatePicker.vue'
import type { DisplayStudent } from '@/stores/students'
import {
  IconUser,
  IconX,
} from '@tabler/icons-vue'

const props = defineProps<{
  isOpen: boolean
  student: DisplayStudent | null
  classes: Array<{ id: string; name: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: Record<string, unknown>, file: File | null): void
}>()

interface StudentForm {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  placeOfBirth: string
  phone: string
  email: string
  classId: string
  status: string
  profileImage: string
}

const formData = ref<StudentForm>({
  id: '',
  studentCode: '',
  firstName: '',
  lastName: '',
  gender: 'male',
  dateOfBirth: '',
  placeOfBirth: '',
  phone: '',
  email: '',
  classId: '',
  status: 'Active',
  profileImage: '',
})

const errors = ref<Record<string, string>>({})
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

// Dropdown open states
const isGenderOpen = ref(false)
const isClassOpen = ref(false)
const isStatusOpen = ref(false)

watch(
  [() => props.isOpen, () => props.student],
  ([newOpen, newStudent]) => {
    if (newOpen && newStudent) {
      errors.value = {}
      selectedFile.value = null
      closeAllDropdowns()
      
      // Normalize values to avoid placeholder issues (converting '—' to '')
      const cleanField = (val: unknown) => (val === '—' || val === null || val === undefined) ? '' : String(val)
      
      // Parse gender status to standard casings
      let normalizedStatus = cleanField(newStudent.status)
      if (normalizedStatus.toLowerCase() === 'active') normalizedStatus = 'Active'
      if (normalizedStatus.toLowerCase() === 'suspended') normalizedStatus = 'Suspended'
      if (normalizedStatus.toLowerCase() === 'graduated') normalizedStatus = 'Graduated'

      formData.value = {
        id: cleanField(newStudent.id),
        studentCode: cleanField(newStudent.studentCode),
        firstName: cleanField(newStudent.firstName),
        lastName: cleanField(newStudent.lastName),
        gender: cleanField(newStudent.gender).toLowerCase() || 'male',
        dateOfBirth: cleanField(newStudent.dateOfBirth),
        placeOfBirth: cleanField(newStudent.placeOfBirth),
        phone: cleanField(newStudent.phone),
        email: cleanField(newStudent.email),
        classId: cleanField(newStudent.classId),
        status: normalizedStatus || 'Active',
        profileImage: newStudent.profileImage || '',
      }
    }
  },
  { immediate: true }
)

function closeAllDropdowns() {
  isGenderOpen.value = false
  isClassOpen.value = false
  isStatusOpen.value = false
}

function toggleDropdown(type: 'gender' | 'class' | 'status') {
  if (type === 'gender') {
    isGenderOpen.value = !isGenderOpen.value
    isClassOpen.value = false
    isStatusOpen.value = false
  } else if (type === 'class') {
    isClassOpen.value = !isClassOpen.value
    isGenderOpen.value = false
    isStatusOpen.value = false
  } else if (type === 'status') {
    isStatusOpen.value = !isStatusOpen.value
    isGenderOpen.value = false
    isClassOpen.value = false
  }
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    formData.value.profileImage = reader.result as string
  }
  reader.readAsDataURL(file)
}

function sanitizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr === '—') return null
  const parsed = Date.parse(dateStr)
  if (isNaN(parsed)) return null
  const d = new Date(parsed)
  return d.toISOString() // return ISO 8601 string
}

function handleSave() {
  const validationErrors: Record<string, string> = {}
  if (!formData.value.studentCode.trim()) validationErrors.studentCode = 'Student Code is required'
  if (!formData.value.firstName.trim()) validationErrors.firstName = 'First Name is required'
  if (!formData.value.lastName.trim()) validationErrors.lastName = 'Last Name is required'
  if (!formData.value.email.trim()) {
    validationErrors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    validationErrors.email = 'Invalid email format'
  }

  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    return
  }

  const payload = {
    firstName: formData.value.firstName.trim(),
    lastName: formData.value.lastName.trim(),
    email: formData.value.email.trim(),
    phone: formData.value.phone.trim() || null,
    studentCode: formData.value.studentCode.trim(),
    gender: formData.value.gender.toLowerCase(),
    placeOfBirth: formData.value.placeOfBirth.trim() || null,
    dateOfBirth: sanitizeDate(formData.value.dateOfBirth),
    classId: formData.value.classId || null,
    status: formData.value.status.toLowerCase(),
  }

  emit('save', payload, selectedFile.value)
}

function handleClose() {
  emit('close')
}

// Click outside helper
function onOutsideClick(e: MouseEvent) {
  const target = e.target as Element
  if (!target.closest('.custom-dropdown-container')) {
    closeAllDropdowns()
  }
}
</script>

<template>
  <div 
    v-if="isOpen" 
    @click="onOutsideClick"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 overflow-y-auto"
  >
    <!-- Modal content -->
    <div 
      @click.stop
      class="bg-white rounded-[8px] w-full max-w-lg shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-none text-left"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800">Edit Student Record</h3>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <div class="p-5 overflow-y-auto flex-1 space-y-4">
        <!-- Profile Picture Upload -->
        <div class="flex items-center gap-4 border border-dashed border-slate-200 rounded-[5px] p-3 bg-slate-50/50">
          <div class="relative w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            <IconUser class="absolute inset-0 m-auto w-8 h-8 text-slate-300" />
            <img v-if="formData.profileImage" :src="formData.profileImage" class="relative z-10 w-full h-full object-cover" />
          </div>
          <div>
            <input 
              type="file" 
              ref="fileInput" 
              @change="onFileSelected" 
              accept="image/*" 
              class="hidden" 
            />
            <button 
              type="button" 
              @click="fileInput?.click()"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-[3px] transition-colors shadow-sm"
            >
              Change Profile Image
            </button>
            <p class="text-[9px] text-slate-400 mt-1">Accepts PNG, JPG, GIF up to 2MB</p>
          </div>
        </div>

        <!-- First and Last Name Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name *</label>
            <input 
              v-model="formData.firstName" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              :class="errors.firstName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="First name..."
            />
            <p v-if="errors.firstName" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.firstName }}</p>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name *</label>
            <input 
              v-model="formData.lastName" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              :class="errors.lastName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="Last name..."
            />
            <p v-if="errors.lastName" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- Student Code & Phone Number -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Student Code *</label>
            <input 
              v-model="formData.studentCode" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white font-bold text-slate-500 bg-slate-50"
              :class="errors.studentCode ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="e.g. STU-001"
            />
            <p v-if="errors.studentCode" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.studentCode }}</p>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
            <input 
              v-model="formData.phone" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              placeholder="e.g. +855092..."
            />
          </div>
        </div>

        <!-- Gmail Address -->
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gmail Address *</label>
          <input 
            v-model="formData.email" 
            type="email" 
            class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
            :class="errors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
            placeholder="Gmail address..."
          />
          <p v-if="errors.email" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.email }}</p>
        </div>

        <!-- Place of Birth & Date of Birth -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Place of Birth</label>
            <input 
              v-model="formData.placeOfBirth" 
              type="text" 
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              placeholder="Kampong Cham..."
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date of Birth</label>
            <CustomDatePicker 
              v-model="formData.dateOfBirth" 
              placeholder="Select date of birth..."
            />
          </div>
        </div>

        <!-- Gender, Class, Status dropdowns -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Gender -->
          <div class="relative custom-dropdown-container">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</label>
            <button
              type="button"
              @click.stop="toggleDropdown('gender')"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px]"
            >
              <span class="capitalize">{{ formData.gender }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isGenderOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="isGenderOpen"
              class="absolute left-0 mt-1 w-full bg-white border border-slate-100 shadow-lg rounded-[8px] z-50 py-1"
            >
              <button
                v-for="g in ['male', 'female', 'other']"
                :key="g"
                type="button"
                @click="formData.gender = g; isGenderOpen = false"
                class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors capitalize"
                :class="{ 'text-[#ff9c07] bg-slate-50/50': formData.gender === g }"
              >
                {{ g }}
              </button>
            </div>
          </div>

          <!-- Class -->
          <div class="relative custom-dropdown-container">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Class</label>
            <button
              type="button"
              @click.stop="toggleDropdown('class')"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px]"
            >
              <span class="truncate pr-1">{{ classes.find(c => c.id === formData.classId)?.name || 'Select' }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isClassOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="isClassOpen"
              class="absolute left-0 mt-1 w-full bg-white border border-slate-100 shadow-lg rounded-[8px] z-50 py-1 max-h-48 overflow-y-auto"
            >
              <button
                v-for="c in classes"
                :key="c.id"
                type="button"
                @click="formData.classId = c.id; isClassOpen = false"
                class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors"
                :class="{ 'text-[#ff9c07] bg-slate-50/50': formData.classId === c.id }"
              >
                {{ c.name }}
              </button>
            </div>
          </div>

          <!-- Status -->
          <div class="relative custom-dropdown-container">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <button
              type="button"
              @click.stop="toggleDropdown('status')"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px]"
            >
              <span class="capitalize">{{ formData.status }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isStatusOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="isStatusOpen"
              class="absolute left-0 mt-1 w-full bg-white border border-slate-100 shadow-lg rounded-[8px] z-50 py-1"
            >
              <button
                v-for="s in ['Active', 'Suspended', 'Graduated']"
                :key="s"
                type="button"
                @click="formData.status = s; isStatusOpen = false"
                class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors shadow-none"
                :class="{ 'text-[#ff9c07] bg-slate-50/50': formData.status === s }"
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex items-center justify-end gap-2 p-5 border-t border-slate-100 bg-slate-50/30">
        <button 
          @click="handleClose"
          class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-4 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button 
          @click="handleSave"
          class="rounded-[3px] bg-slate-900 text-white px-4 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>
