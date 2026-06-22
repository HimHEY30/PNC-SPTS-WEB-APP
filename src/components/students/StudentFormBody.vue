<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { ref, computed } from 'vue'
import CustomDatePicker from '@/components/ui/CustomDatePicker.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import { IconUser, IconChevronDown } from '@tabler/icons-vue'

interface FormData {
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

const props = defineProps<{
  formData: FormData
  errors: Record<string, string>
  classes: Array<{ id: string; name: string }>
  readonlyCode?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectFile', file: File): void
  (e: 'removeImage'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const genderDropdownOpen = ref(false)
const classDropdownOpen = ref(false)
const statusDropdownOpen = ref(false)

const genderOptions: DropdownOption[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const classOptions = computed<DropdownOption[]>(() =>
  props.classes.map((c) => ({ value: c.id, label: c.name })),
)

const statusOptions: DropdownOption[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Graduated', label: 'Graduated' },
]

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    props.formData.profileImage = reader.result as string
  }
  reader.readAsDataURL(file)
  emit('selectFile', file)
}

function removeImage() {
  props.formData.profileImage = ''
  if (fileInput.value) fileInput.value.value = ''
  emit('removeImage')
}
</script>

<template>
  <div class="p-5 flex-1 space-y-4">
    <!-- Profile Picture Upload -->
    <div class="flex items-center gap-4 border border-dashed border-slate-200 rounded-[5px] p-3 bg-slate-50/50">
      <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
        <img v-if="formData.profileImage" :src="formData.profileImage" class="h-full w-full object-cover" />
        <IconUser v-else class="w-6 h-6 text-slate-400" />
      </div>
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Image</label>
        <div class="flex items-center gap-2">
          <input type="file" ref="fileInput" @change="onFileSelected" accept="image/*" class="hidden" />
          <button type="button" @click="fileInput?.click()" class="px-3 py-1 bg-white border border-slate-200 rounded-[3px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Choose Photo</button>
          <button v-if="formData.profileImage" type="button" @click="removeImage" class="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors">Remove</button>
        </div>
      </div>
    </div>

    <!-- First and Last Name Grid -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name *</label>
        <input v-model="formData.firstName" type="text" class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white" :class="errors.firstName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'" placeholder="First name..." />
        <p v-if="errors.firstName" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.firstName }}</p>
      </div>
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name *</label>
        <input v-model="formData.lastName" type="text" class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white" :class="errors.lastName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'" placeholder="Last name..." />
        <p v-if="errors.lastName" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.lastName }}</p>
      </div>
    </div>

    <!-- Student Code & Phone Number -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Student Code *</label>
        <input v-model="formData.studentCode" type="text" class="w-full rounded-[3px] border px-3 py-1.5 text-xs placeholder-slate-400 focus:outline-none bg-white" :class="[readonlyCode ? 'font-bold text-slate-500 bg-slate-50' : 'text-slate-700', errors.studentCode ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400']" placeholder="e.g. STU-001" />
        <p v-if="errors.studentCode" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.studentCode }}</p>
      </div>
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
        <input v-model="formData.phone" type="text" class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white" :class="errors.phone ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'" placeholder="e.g. +855092..." />
        <p v-if="errors.phone" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.phone }}</p>
      </div>
    </div>

    <!-- Gmail Address -->
    <div>
      <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gmail Address *</label>
      <input v-model="formData.email" type="email" class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white" :class="errors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'" placeholder="Gmail address..." />
      <p v-if="errors.email" class="text-[9px] text-red-500 font-bold mt-0.5">{{ errors.email }}</p>
    </div>

    <!-- Place of Birth & Date of Birth -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Place of Birth</label>
        <input v-model="formData.placeOfBirth" type="text" class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white" placeholder="Kampong Cham..." />
      </div>
      <div>
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date of Birth</label>
        <CustomDatePicker v-model="formData.dateOfBirth" placeholder="Select date of birth..." />
      </div>
    </div>

    <!-- Gender, Class, Status dropdowns -->
    <div class="grid grid-cols-3 gap-3">
      <div class="relative" v-click-outside="() => (genderDropdownOpen = false)">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</label>
        <button type="button" @click.stop="genderDropdownOpen = !genderDropdownOpen" class="mt-0.5 w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[32px] focus:outline-none focus:border-purple-300 transition-colors">
          <span>{{ genderOptions.find((o) => o.value === formData.gender)?.label || 'Select Gender' }}</span>
          <IconChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': genderDropdownOpen }" />
        </button>
        <div v-if="genderDropdownOpen" class="absolute left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-[5px] z-50 py-1 max-h-60 overflow-y-auto">
          <button v-for="opt in genderOptions" :key="opt.value" type="button" @click="formData.gender = opt.value; genderDropdownOpen = false" class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between transition-colors" :class="{ 'text-indigo-600 bg-indigo-50/30': formData.gender === opt.value }">{{ opt.label }}</button>
        </div>
      </div>
      <div class="relative" v-click-outside="() => (classDropdownOpen = false)">
        <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Class</label>
        <button type="button" @click.stop="classDropdownOpen = !classDropdownOpen" class="mt-0.5 w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[32px] focus:outline-none focus:border-purple-300 transition-colors">
          <span>{{ classOptions.find((o) => o.value === formData.classId)?.label || 'Select Class' }}</span>
          <IconChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': classDropdownOpen }" />
        </button>
        <div v-if="classDropdownOpen" class="absolute left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-[5px] z-50 py-1 max-h-60 overflow-y-auto">
          <button v-for="opt in classOptions" :key="opt.value" type="button" @click="formData.classId = opt.value; classDropdownOpen = false" class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between transition-colors" :class="{ 'text-indigo-600 bg-indigo-50/30': formData.classId === opt.value }">{{ opt.label }}</button>
        </div>
      </div>
      <div class="relative" v-click-outside="() => (statusDropdownOpen = false)">
        <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
        <button type="button" @click.stop="statusDropdownOpen = !statusDropdownOpen" class="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[32px] focus:outline-none focus:border-purple-300 transition-colors">
          <span>{{ statusOptions.find((o) => o.value === formData.status)?.label || 'Select Status' }}</span>
          <IconChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': statusDropdownOpen }" />
        </button>
        <div v-if="statusDropdownOpen" class="absolute left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-[5px] z-50 py-1 max-h-60 overflow-y-auto">
          <button v-for="opt in statusOptions" :key="opt.value" type="button" @click="formData.status = opt.value; statusDropdownOpen = false" class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between transition-colors" :class="{ 'text-indigo-600 bg-indigo-50/30': formData.status === opt.value }">{{ opt.label }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
