<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentsStore } from '@/stores/students'
import { useClassesStore } from '@/stores/classes'
import { useToastStore } from '@/stores/toast'
import {
  IconEdit,
  IconUser,
} from '@tabler/icons-vue'
import { getErrorMessage } from '@/services/api'
import type { UpdateStudentPayload } from '@/types/student'
import EditStudentModal from '@/components/students/EditStudentModal.vue'
import bannerSrc from '@/assets/images/profile_banner.jpg'

const route = useRoute()
const store = useStudentsStore()
const classesStore = useClassesStore()
const toast = useToastStore()

const studentId = computed(() => route.params.id as string)

const student = ref({
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  createdAt: '',
  status: 'Active',
  avatar: '',
  studentCode: '',
  placeOfBirth: '',
  gender: '',
  classId: '',
})

const stats = ref({
  enrolledCourses: 4,
  completedCredits: 12,
  gpa: 3.5,
})

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
  if (!classesStore.fetched) {
    await classesStore.fetchClasses()
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

const showEditModal = ref(false)

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

async function handleSaveStudent(payload: UpdateStudentPayload, file: File | null) {
  try {
    const updated = await store.updateStudent(student.value.id, payload, file)
    if (updated) {
      student.value = {
        ...student.value,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        address: updated.placeOfBirth,
        avatar: updated.profileImage || '',
        studentCode: updated.studentCode,
        placeOfBirth: updated.placeOfBirth,
        status: updated.status,
      }
    }
    closeEditModal()
    toast.showToast('Student updated successfully!')
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to update student')
    toast.showToast(msg, 'error')
  }
}

</script>

<template>
  <div class="space-y-6 max-w-[1600px] mx-auto pb-8 text-left">

    <!-- Banner Image -->
    <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden relative text-left">
      <div class="h-16 md:h-20 w-full overflow-hidden bg-slate-50 relative">
        <img :src="bannerSrc" class="w-full h-full object-cover" alt="Banner" />
      </div>
    </div>

    <!-- Avatar + Profile info row overlapping the banner -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between relative">
      <div class="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
        <div class="w-20 h-20 md:w-24 md:h-24 rounded-full border-3 border-white bg-slate-50 shadow-sm overflow-hidden shrink-0 flex items-center justify-center -mt-10 md:-mt-12 z-10 select-none">
          <img v-if="student.avatar" :src="student.avatar" class="w-full h-full object-cover" alt="Avatar" />
          <IconUser v-else class="w-8 h-8 text-slate-400" />
        </div>
        <div class="text-center sm:text-left pb-1">
          <h2 class="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-none mb-1">{{ student.name }}</h2>
          <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
            <span class="rounded-[3px] bg-slate-100 text-slate-700 px-2 py-0.5 text-[9px] font-medium leading-none">{{ student.studentCode }}</span>
            <span v-if="student.classId" class="rounded-[3px] bg-slate-100 text-slate-700 px-2 py-0.5 text-[9px] font-medium leading-none">{{ classesStore.getName(student.classId) }}</span>
            <span :class="['rounded-[3px] px-2 py-0.5 text-[9px] font-medium leading-none flex items-center gap-1', statusClass(student.status)]">
              <span class="w-1.5 h-1.5 rounded-full" :class="{'bg-green-500': student.status === 'Active', 'bg-yellow-500': student.status === 'Suspended', 'bg-red-500': student.status === 'Graduated'}"></span>
              {{ student.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 12-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

      <!-- Left Column (8 cols) -->
      <div class="lg:col-span-8 space-y-6">

        <!-- Ask Me About Card -->
        <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800">Ask Me About</h3>
            <button @click="openEditModal" class="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-[3px] px-3 py-1.5 text-xs font-medium shadow-sm transition-all flex items-center gap-1 cursor-pointer">
              <IconEdit class="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-500">No topics added yet.</p>
          </div>
        </div>

        <!-- Summary Card -->
        <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800">Summary</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="text-center">
                <p class="text-2xl font-bold text-slate-800 leading-none">{{ stats.enrolledCourses }}</p>
                <p class="text-xs text-slate-400 mt-1">Enrolled Courses</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-slate-800 leading-none">{{ stats.completedCredits }}</p>
                <p class="text-xs text-slate-400 mt-1">Completed Credits</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-slate-800 leading-none">{{ stats.gpa }}</p>
                <p class="text-xs text-slate-400 mt-1">Current GPA</p>
              </div>
              <div class="text-center">
                <p class="text-lg font-bold text-slate-800 leading-none">
                  <span :class="student.status === 'Active' ? 'text-green-600' : student.status === 'Suspended' ? 'text-yellow-600' : 'text-red-600'">{{ student.status }}</span>
                </p>
                <p class="text-xs text-slate-400 mt-1">Status</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendance Card -->
        <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800">Attendance</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-500">No attendance data available.</p>
          </div>
        </div>

        <!-- Grades Card -->
        <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800">Grades</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-500">No grades data available.</p>
          </div>
        </div>

      </div>

      <!-- Right Column (4 cols) -->
      <div class="lg:col-span-4 space-y-6">

        <!-- My Manager Card -->
        <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800">My Manager</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-500">No manager assigned.</p>
          </div>
        </div>

        <!-- Additional Details Card -->
        <div class="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100 overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100">
            <h3 class="text-sm font-bold text-slate-800">Additional Details</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-400">Email</p>
                <p class="text-sm font-medium text-slate-700">{{ student.email }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Phone</p>
                <p class="text-sm font-medium text-slate-700">{{ student.phone }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Enrolled</p>
                <p class="text-sm font-medium text-slate-700">{{ student.createdAt }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Class</p>
                <p class="text-sm font-medium text-slate-700">{{ classesStore.getName(student.classId) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <EditStudentModal
      :is-open="showEditModal"
      :student="storeStudent ?? null"
      :classes="classesStore.classes"
      @close="closeEditModal"
      @save="handleSaveStudent"
    />
  </div>
</template>

