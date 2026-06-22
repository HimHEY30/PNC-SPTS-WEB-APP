<script setup lang="ts">
import { ref, watch } from 'vue'
import StudentFormBody from '@/components/students/StudentFormBody.vue'
import type { CreateStudentPayload } from '@/types/student'
import { IconX } from '@tabler/icons-vue'

const props = defineProps<{
  isOpen: boolean
  classes: Array<{ id: string; name: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: CreateStudentPayload, file: File | null): void
}>()

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

const formData = ref<FormData>({
  studentCode: '',
  firstName: '',
  lastName: '',
  gender: 'male',
  dateOfBirth: '',
  placeOfBirth: '',
  phone: '',
  email: '',
  classId: '1',
  status: 'Active',
  profileImage: '',
})

const errors = ref<Record<string, string>>({})
const selectedFile = ref<File | null>(null)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      formData.value = {
        studentCode: '',
        firstName: '',
        lastName: '',
        gender: 'male',
        dateOfBirth: '',
        placeOfBirth: '',
        phone: '',
        email: '',
        classId: props.classes[0]?.id || '1',
        status: 'Active',
        profileImage: '',
      }
      selectedFile.value = null
      errors.value = {}
    }
  },
)

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
  if (formData.value.phone.trim() && !/^\+?[0-9\s-]{8,15}$/.test(formData.value.phone)) {
    validationErrors.phone = 'Invalid phone number format'
  }

  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    return
  }

  const payload: CreateStudentPayload = {
    studentCode: formData.value.studentCode.trim(),
    firstName: formData.value.firstName.trim(),
    lastName: formData.value.lastName.trim(),
    gender: formData.value.gender.toLowerCase(),
    dateOfBirth: formData.value.dateOfBirth || null,
    placeOfBirth: formData.value.placeOfBirth || null,
    email: formData.value.email.trim(),
    phone: formData.value.phone.trim() || null,
    classId: formData.value.classId || null,
    status: formData.value.status.toLowerCase(),
  }

  emit('save', payload, selectedFile.value)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
    <div @click.stop class="bg-white rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800">Add New Student</h3>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <StudentFormBody
        :formData="formData"
        :errors="errors"
        :classes="classes"
        @selectFile="selectedFile = $event"
        @removeImage="selectedFile = null"
      />

      <div class="flex items-center justify-end gap-2 p-5 border-t border-slate-100 bg-slate-50/30">
        <button @click="handleClose" class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-4 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
        <button @click="handleSave" class="rounded-[3px] bg-slate-900 text-white px-4 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">Add Student</button>
      </div>
    </div>
  </div>
</template>
