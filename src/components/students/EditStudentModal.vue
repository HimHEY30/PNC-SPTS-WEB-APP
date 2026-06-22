<script setup lang="ts">
import { ref, watch } from 'vue'
import StudentFormBody from '@/components/students/StudentFormBody.vue'
import type { DisplayStudent } from '@/stores/students'
import type { UpdateStudentPayload } from '@/types/student'
import { IconX } from '@tabler/icons-vue'

const props = defineProps<{
  isOpen: boolean
  student: DisplayStudent | null
  classes: Array<{ id: string; name: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: UpdateStudentPayload, file: File | null): void
}>()

interface FormData {
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

const formData = ref<FormData>({
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
const selectedFile = ref<File | null>(null)

watch(
  [() => props.isOpen, () => props.student],
  ([newOpen, newStudent]) => {
    if (newOpen && newStudent) {
      errors.value = {}
      selectedFile.value = null

      const cleanField = (val: unknown) =>
        val === '—' || val === null || val === undefined ? '' : String(val)

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
  { immediate: true },
)

function sanitizeDate(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr === '—') return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const parsed = Date.parse(dateStr)
  if (isNaN(parsed)) return null
  const d = new Date(parsed)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
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
  if (formData.value.phone.trim() && !/^\+?[0-9\s-]{8,15}$/.test(formData.value.phone)) {
    validationErrors.phone = 'Invalid phone number format'
  }

  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors
    return
  }

  const payload: UpdateStudentPayload = {
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

  if (formData.value.profileImage === '') {
    payload.profileImage = null
  }

  emit('save', payload, selectedFile.value)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
    <div @click.stop class="bg-white rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] animate-none text-left">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800">Edit Student Record</h3>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg">
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <StudentFormBody
        :formData="formData"
        :errors="errors"
        :classes="classes"
        :readonlyCode="true"
        @selectFile="selectedFile = $event"
        @removeImage="selectedFile = null"
      />

      <div class="flex items-center justify-end gap-2 p-5 border-t border-slate-100 bg-slate-50/30">
        <button @click="handleClose" class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-4 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
        <button @click="handleSave" class="rounded-[3px] bg-slate-900 text-white px-4 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm">Save Changes</button>
      </div>
    </div>
  </div>
</template>
