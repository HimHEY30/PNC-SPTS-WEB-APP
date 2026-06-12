<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentsStore, type DisplayStudent } from '@/stores/students'
import CustomDatePicker from '@/components/ui/CustomDatePicker.vue'
import { useClassesStore } from '@/stores/classes'
import BaseDropdown, { type DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import {
  IconSearch,
  IconPlus,
  IconUser,
  IconUsers,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconCopy,
  IconX,
  IconCircleDot,
} from '@tabler/icons-vue'

const router = useRouter()
const store = useStudentsStore()
const classesStore = useClassesStore()

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedStatus = ref('')

const statusCounts = computed(() => ({
  all: store.students.length,
  Active: store.students.filter(s => s.status === 'Active').length,
  Suspended: store.students.filter(s => s.status === 'Suspended').length,
  Graduated: store.students.filter(s => s.status === 'Graduated').length,
}))

const statusOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Status', count: statusCounts.value.all },
  { value: 'Active', label: 'Active', count: statusCounts.value.Active },
  { value: 'Suspended', label: 'Suspended', count: statusCounts.value.Suspended },
  { value: 'Graduated', label: 'Graduated', count: statusCounts.value.Graduated },
])

// Edit Student Modal State
const isEditModalOpen = ref(false)
const editingStudent = ref<DisplayStudent | null>(null)

// Add Student Modal State
const isAddModalOpen = ref(false)
const addFormData = ref({
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
const addFormErrors = ref<Record<string, string>>({})
const addStudentFileInput = ref<HTMLInputElement | null>(null)
const selectedAddStudentFile = ref<File | null>(null)

// Custom Dropdown open states for Add Student Modal
const isAddGenderOpen = ref(false)
const isAddClassOpen = ref(false)
const isAddStatusOpen = ref(false)

// Custom Dropdown open states for Edit Student Modal
const isEditClassOpen = ref(false)
const isEditStatusOpen = ref(false)

// Page size dropdown state
const isPageSizeOpen = ref(false)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Dynamic styles for teleported dropdowns
const dropdownStyles = ref<Record<string, Record<string, string>>>({
  addGender: {},
  addClass: {},
  addStatus: {},
  editClass: {},
  editStatus: {},
  pageSize: {}
})

const activeDropdownKey = ref<string | null>(null)
let activeTriggerEl: HTMLElement | null = null

function updateDropdownPosition(key: string, triggerEl: HTMLElement) {
  const rect = triggerEl.getBoundingClientRect()
  const width = rect.width
  const top = rect.bottom + window.scrollY + 4
  const left = rect.left + window.scrollX
  
  if (key === 'pageSize') {
    const popoverHeight = 110
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
      const upwardTop = rect.top + window.scrollY - popoverHeight - 4
      dropdownStyles.value[key] = {
        position: 'absolute',
        top: `${upwardTop}px`,
        left: `${left}px`,
        width: `${width}px`
      }
      return
    }
  }

  dropdownStyles.value[key] = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`
  }
}

function openDropdown(key: string, triggerEl: HTMLElement) {
  isAddGenderOpen.value = key === 'addGender'
  isAddClassOpen.value = key === 'addClass'
  isAddStatusOpen.value = key === 'addStatus'
  isEditClassOpen.value = key === 'editClass'
  isEditStatusOpen.value = key === 'editStatus'
  isPageSizeOpen.value = key === 'pageSize'
  
  activeDropdownKey.value = key
  activeTriggerEl = triggerEl
  updateDropdownPosition(key, triggerEl)
}

function closeAllDropdowns() {
  isAddGenderOpen.value = false
  isAddClassOpen.value = false
  isAddStatusOpen.value = false
  isEditClassOpen.value = false
  isEditStatusOpen.value = false
  isPageSizeOpen.value = false
  activeDropdownKey.value = null
  activeTriggerEl = null
}

function toggleDropdown(key: string, event: MouseEvent) {
  if (activeDropdownKey.value === key) {
    closeAllDropdowns()
  } else {
    openDropdown(key, event.currentTarget as HTMLElement)
  }
}

function handleScrollOrResize() {
  if (activeDropdownKey.value && activeTriggerEl) {
    updateDropdownPosition(activeDropdownKey.value, activeTriggerEl)
  }
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Element
  if (!target || !activeDropdownKey.value) return
  
  const key = activeDropdownKey.value
  const clickedInside = target.closest(`.custom-dropdown-${key}`)
  
  if (!clickedInside) {
    closeAllDropdowns()
  }
}

// Pagination computations
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => currentPage.value * itemsPerPage.value)
const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage.value))

const paginatedStudents = computed(() => {
  return filtered.value.slice(startIndex.value, endIndex.value)
})

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

watch([searchQuery, selectedStatus], () => {
  currentPage.value = 1
})




const filtered = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return store.students.filter(s => {
    const className = classesStore.getName(s.classId)
    const matchesSearch = !q || 
                          (s.firstName && s.firstName.toLowerCase().includes(q)) || 
                          (s.lastName && s.lastName.toLowerCase().includes(q)) || 
                          (s.studentCode && s.studentCode.toLowerCase().includes(q)) || 
                          (s.email && s.email.toLowerCase().includes(q)) ||
                          (s.placeOfBirth && s.placeOfBirth.toLowerCase().includes(q)) ||
                          className.toLowerCase().includes(q)
    const matchesStatus = !selectedStatus.value || s.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
})

const statusClass = (s: string) => {
  switch (s) {
    case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Suspended': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Graduated': return 'bg-blue-50 text-blue-700 border-blue-200'
    default: return 'bg-slate-100 text-slate-500 border-slate-200'
  }
}



function navigateProfile(id: string) {
  router.push(`/admin/students/${id}`)
}

import { api } from '@/services/api'

const studentFileInput = ref<HTMLInputElement | null>(null)
const selectedStudentFile = ref<File | null>(null)

function onStudentFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedStudentFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    if (editingStudent.value) {
      editingStudent.value.profileImage = reader.result as string
    }
  }
  reader.readAsDataURL(file)
}

function startEdit(student: DisplayStudent) {
  editingStudent.value = { ...student }
  selectedStudentFile.value = null
  isEditModalOpen.value = true
}

function closeEditModal() {
  editingStudent.value = null
  selectedStudentFile.value = null
  isEditModalOpen.value = false
}

async function saveStudent() {
  const studentData = editingStudent.value
  if (!studentData) return
  
  let uploadedUrl = studentData.profileImage
  
  try {
    if (selectedStudentFile.value) {
      const fd = new FormData()
      fd.append('image', selectedStudentFile.value)
      const resImg = await api.post('/api/users/profile/image', fd)
      if (resImg.data?.data?.url) {
        uploadedUrl = resImg.data.data.url
      } else if (resImg.data?.url) {
        uploadedUrl = resImg.data.url
      }
    }
    
    const payload = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      studentCode: studentData.studentCode,
      placeOfBirth: studentData.placeOfBirth,
      classId: studentData.classId,
      status: studentData.status,
      profileImage: uploadedUrl,
    }
    
    await api.patch(`/api/students/${studentData.id}`, payload)
    await store.fetchStudents()
  } catch (err) {
    console.error('Failed to update student in database:', err)
    
    const idx = store.students.findIndex(s => s.id === studentData.id)
    if (idx !== -1) {
      const updated = {
        ...store.students[idx],
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        name: `${studentData.firstName} ${studentData.lastName}`,
        email: studentData.email,
        studentCode: studentData.studentCode,
        placeOfBirth: studentData.placeOfBirth,
        classId: studentData.classId,
        status: studentData.status,
        profileImage: uploadedUrl,
        updatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      }
      store.students[idx] = updated
      localStorage.setItem('students_cache', JSON.stringify(store.students))
    }
  }
  
  closeEditModal()
}

function openAddModal() {
  addFormData.value = {
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
  }
  selectedAddStudentFile.value = null
  addFormErrors.value = {}
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
  selectedAddStudentFile.value = null
}

function onAddStudentFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedAddStudentFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    addFormData.value.profileImage = reader.result as string
  }
  reader.readAsDataURL(file)
}

async function createStudent() {
  const errors: Record<string, string> = {}
  if (!addFormData.value.studentCode.trim()) errors.studentCode = 'Student Code is required'
  if (!addFormData.value.firstName.trim()) errors.firstName = 'First Name is required'
  if (!addFormData.value.lastName.trim()) errors.lastName = 'Last Name is required'
  if (!addFormData.value.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.value.email)) {
    errors.email = 'Invalid email format'
  }
  if (!addFormData.value.phone.trim()) errors.phone = 'Phone number is required'

  if (Object.keys(errors).length > 0) {
    addFormErrors.value = errors
    return
  }

  let uploadedUrl = ''
  
  try {
    if (selectedAddStudentFile.value) {
      const fd = new FormData()
      fd.append('image', selectedAddStudentFile.value)
      const resImg = await api.post('/api/users/profile/image', fd)
      if (resImg.data?.data?.url) {
        uploadedUrl = resImg.data.data.url
      } else if (resImg.data?.url) {
        uploadedUrl = resImg.data.url
      }
    }

    const payload = {
      studentCode: addFormData.value.studentCode.trim(),
      firstName: addFormData.value.firstName.trim(),
      lastName: addFormData.value.lastName.trim(),
      gender: addFormData.value.gender,
      dateOfBirth: addFormData.value.dateOfBirth || null,
      placeOfBirth: addFormData.value.placeOfBirth || null,
      phone: addFormData.value.phone.trim(),
      email: addFormData.value.email.trim(),
      classId: addFormData.value.classId,
      status: addFormData.value.status,
      profileImage: uploadedUrl || null,
    }

    await api.post('/api/students', payload)
    await store.fetchStudents()
    closeAddModal()
  } catch (err: any) {
    console.error('Failed to add student:', err)
    const serverMsg = err.response?.data?.message || err.message
    addFormErrors.value = { server: typeof serverMsg === 'object' && Array.isArray(serverMsg) ? serverMsg.join(', ') : String(serverMsg) }
  }
}

onMounted(() => {
  if (!store.fetched) store.fetchStudents()
  if (!classesStore.fetched) classesStore.fetchClasses()
  document.addEventListener('click', handleDocumentClick)
  window.addEventListener('resize', handleScrollOrResize)
  window.addEventListener('scroll', handleScrollOrResize, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  window.removeEventListener('resize', handleScrollOrResize)
  window.removeEventListener('scroll', handleScrollOrResize, true)
})
</script>

<template>
  <div class="space-y-4 max-w-[1400px] mx-auto pb-8">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-base font-bold text-[#0f172a]">Student List</h1>
        <p class="text-xs text-slate-400 mt-0.5">{{ store.students.length }} students enrolled</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="store.fetchStudents()"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-[3px] transition-colors"
        >
          <IconRefresh class="w-3.5 h-3.5" />
          Refresh
        </button>
        <button
          @click="openAddModal"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-[3px] transition-colors"
        >
          <IconPlus class="w-3.5 h-3.5" />
          Add Student
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.students.length === 0" class="flex items-center justify-center py-16">
      <div class="flex items-center gap-3 text-slate-400">
        <div class="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
        <span class="text-xs font-bold">Loading students...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="store.error && store.students.length === 0" class="text-center py-16">
      <IconUsers class="mx-auto w-12 h-12 text-slate-200" />
      <p class="text-xs font-bold text-slate-500 mt-3">{{ store.error }}</p>
      <button @click="store.fetchStudents()" class="mt-3 text-xs text-indigo-600 hover:underline font-bold">Retry</button>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Filters -->
      <div class="bg-white rounded-[5px] border border-slate-100 p-3 flex flex-wrap items-center gap-3 shadow-sm">
        <div class="relative flex-1 min-w-[240px] max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, code or class..."
            class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[3px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
          />
          <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <BaseDropdown
          v-model="selectedStatus"
          :options="statusOptions"
          :icon="IconCircleDot"
          placeholder="All Status"
          size="sm"
        />
      </div>

      <!-- Student Table (Responsive HTML Table Layout) -->
      <div class="bg-white rounded-[5px] border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Code</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profile</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gmail</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Place of Birth</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <template v-for="s in paginatedStudents" :key="s.id">
                <!-- Row -->
                <tr class="hover:bg-slate-50/30 transition-colors group">
                  <!-- Student Code -->
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                      {{ s.studentCode }}
                    </span>
                  </td>

                  <!-- Profile Image -->
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden">
                      <img v-if="s.profileImage" :src="s.profileImage" class="w-full h-full object-cover" />
                      <IconUser v-else class="w-4 h-4 text-indigo-500 shrink-0" />
                    </div>
                  </td>

                  <!-- First Name -->
                  <td class="px-4 py-3 whitespace-nowrap text-xs font-bold text-[#475569]">
                    {{ s.firstName }}
                  </td>

                  <!-- Last Name -->
                  <td class="px-4 py-3 whitespace-nowrap text-xs font-bold text-[#475569]">
                    {{ s.lastName }}
                  </td>

                  <!-- Gmail -->
                  <td class="px-4 py-3 whitespace-nowrap text-xs font-bold text-slate-500">
                    {{ s.email }}
                  </td>

                  <!-- Place of Birth -->
                  <td class="px-4 py-3 whitespace-nowrap text-xs font-medium text-slate-500">
                    {{ s.placeOfBirth }}
                  </td>

                  <!-- Class Name -->
                  <td class="px-4 py-3 whitespace-nowrap text-xs font-bold text-[#3b4b6b]">
                    {{ classesStore.getName(s.classId) }}
                  </td>

                  <!-- Status -->
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span :class="['px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border', statusClass(s.status)]">
                      {{ s.status }}
                    </span>
                  </td>

                  <!-- Actions (Edit, Copy, Delete, Expand arrow) -->
                  <td class="px-4 py-3 whitespace-nowrap text-right" @click.stop>
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        @click="navigateProfile(s.id)"
                        class="p-1.5 rounded-[3px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Profile"
                      >
                        <IconUser class="w-4 h-4" />
                      </button>
                      <button
                        @click="startEdit(s)"
                        class="p-1.5 rounded-[3px] text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                      >
                        <IconEdit class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1.5 rounded-[3px] text-slate-400 hover:text-[#3b4b6b] hover:bg-slate-100 transition-colors"
                        title="Copy"
                      >
                        <IconCopy class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1.5 rounded-[3px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete"
                      >
                        <IconTrash class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>


              </template>

              <!-- Empty State inside Table -->
              <tr v-if="filtered.length === 0">
                <td colspan="9" class="py-12 text-center">
                  <IconUsers class="mx-auto w-12 h-12 text-slate-200" />
                  <p class="text-xs font-bold text-slate-500 mt-3">No students found</p>
                  <p class="text-[10px] text-slate-400 mt-1">Try adjusting your filters or search query.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer / Pagination -->
        <div class="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-400 font-bold select-none">
          <!-- Page size selector & status info -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5">
              <span>Show</span>
              <div class="relative custom-dropdown-pageSize">
                <button
                  type="button"
                  @click.stop="toggleDropdown('pageSize', $event)"
                  class="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1 pr-6 rounded-[3px] outline-none cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between min-w-[50px] custom-dropdown-pageSize shadow-sm"
                >
                  <span>{{ itemsPerPage }}</span>
                  <svg class="w-2.5 h-2.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <Teleport to="body">
                  <div
                    v-if="isPageSizeOpen"
                    :style="dropdownStyles.pageSize"
                    class="bg-white border border-slate-100 shadow-lg rounded-[8px] z-[9999] py-1 custom-dropdown-pageSize w-[60px]"
                  >
                    <button
                      v-for="size in [5, 10, 20, 50]"
                      :key="size"
                      type="button"
                      @click="itemsPerPage = size; currentPage = 1; closeAllDropdowns()"
                      class="w-full text-center py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors"
                      :class="{ 'text-[#ff9c07] bg-slate-50/50': itemsPerPage === size }"
                    >
                      {{ size }}
                    </button>
                  </div>
                </Teleport>
              </div>
              <span>entries</span>
            </div>
            
            <span>
              Showing {{ filtered.length === 0 ? 0 : startIndex + 1 }} to {{ Math.min(endIndex, filtered.length) }} of {{ filtered.length }} entries
            </span>
          </div>

          <!-- Pagination Controls -->
          <div class="flex items-center gap-1">
            <!-- Previous Button -->
            <button
              type="button"
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-2.5 py-1 border border-slate-200 rounded-[3px] bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-bold text-[10px] cursor-pointer"
            >
              Prev
            </button>

            <!-- Page Number Buttons -->
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              @click="currentPage = page"
              class="w-6 py-1 border rounded-[3px] transition-all font-bold text-[10px] shadow-sm cursor-pointer"
              :class="currentPage === page 
                ? 'bg-[#ff9c07] border-[#ff9c07] text-white' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'"
            >
              {{ page }}
            </button>

            <!-- Next Button -->
            <button
              type="button"
              @click="nextPage"
              :disabled="currentPage === totalPages || totalPages === 0"
              class="px-2.5 py-1 border border-slate-200 rounded-[3px] bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm font-bold text-[10px] cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- EDIT STUDENT MODAL -->
  <div v-if="isEditModalOpen && editingStudent" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h3 class="text-sm font-bold text-slate-800">Edit Student Record</h3>
        <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600 transition-colors">
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <!-- Modal Body (Form Fields) -->
      <div class="space-y-3">
        <!-- Profile Image Uploader -->
        <div class="flex items-center gap-4 border-b border-slate-100 pb-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            <img v-if="editingStudent.profileImage" :src="editingStudent.profileImage" class="w-full h-full object-cover" />
            <IconUser v-else class="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Image</label>
            <button 
              @click="studentFileInput?.click()" 
              type="button"
              class="px-2.5 py-1 bg-white border border-slate-200 rounded-[3px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm animate-none"
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
        <!-- First and Last Name Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name</label>
            <input 
              v-model="editingStudent.firstName" 
              type="text" 
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              placeholder="First name..."
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name</label>
            <input 
              v-model="editingStudent.lastName" 
              type="text" 
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              placeholder="Last name..."
            />
          </div>
        </div>

        <!-- Student Code -->
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Student Code</label>
          <input 
            v-model="editingStudent.studentCode" 
            type="text" 
            class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            placeholder="Student code..."
          />
        </div>

        <!-- Gmail / Email -->
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gmail Address</label>
          <input 
            v-model="editingStudent.email" 
            type="email" 
            class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            placeholder="Gmail..."
          />
        </div>

        <!-- Place of Birth -->
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Place of Birth</label>
          <input 
            v-model="editingStudent.placeOfBirth" 
            type="text" 
            class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            placeholder="Place of birth..."
          />
        </div>

        <!-- Class & Status dropdowns -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Class -->
          <div class="relative edit-class-dropdown custom-dropdown-editClass">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Class</label>
            <button
              type="button"
              @click.stop="toggleDropdown('editClass', $event)"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px] custom-dropdown-editClass"
            >
              <span>{{ classesStore.getName(editingStudent.classId) || 'Select Class' }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isEditClassOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="isEditClassOpen"
                :style="dropdownStyles.editClass"
                class="bg-white border border-slate-100 shadow-lg rounded-[8px] z-[9999] py-1 max-h-[140px] overflow-y-auto custom-scroll-hidden custom-dropdown-editClass"
              >
                <button
                  v-for="c in classesStore.classes"
                  :key="c.id"
                  type="button"
                  @click="editingStudent.classId = c.id; closeAllDropdowns()"
                  class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors"
                  :class="{ 'text-[#ff9c07] bg-slate-50/50': editingStudent.classId === c.id }"
                >
                  {{ c.name }}
                </button>
              </div>
            </Teleport>
          </div>

          <!-- Status -->
          <div class="relative edit-status-dropdown custom-dropdown-editStatus">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <button
              type="button"
              @click.stop="toggleDropdown('editStatus', $event)"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px] custom-dropdown-editStatus"
            >
              <span>{{ editingStudent.status }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isEditStatusOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="isEditStatusOpen"
                :style="dropdownStyles.editStatus"
                class="bg-white border border-slate-100 shadow-lg rounded-[8px] z-[9999] py-1 custom-dropdown-editStatus"
              >
                <button
                  v-for="s in ['Active', 'Suspended', 'Graduated']"
                  :key="s"
                  type="button"
                  @click="editingStudent.status = s; closeAllDropdowns()"
                  class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors"
                  :class="{ 'text-[#ff9c07] bg-slate-50/50': editingStudent.status === s }"
                >
                  {{ s }}
                </button>
              </div>
            </Teleport>
          </div>
        </div>
      </div>

      <!-- Modal Footer (Save / Cancel) -->
      <div class="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
        <button 
          @click="closeEditModal"
          class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="saveStudent"
          class="rounded-[3px] bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>

  <!-- ADD STUDENT MODAL -->
  <div v-if="isAddModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 text-left overflow-y-auto max-h-[90vh]">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h3 class="text-sm font-bold text-slate-800">Add New Student</h3>
        <button @click="closeAddModal" class="text-slate-400 hover:text-slate-600 transition-colors">
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <!-- Server Error Banner -->
      <div v-if="addFormErrors.server" class="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-[3px] text-xs font-semibold text-red-700">
        {{ addFormErrors.server }}
      </div>

      <!-- Modal Body (Form Fields) -->
      <div class="space-y-3">
        <!-- Profile Image Uploader -->
        <div class="flex items-center gap-4 border-b border-slate-100 pb-3">
          <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            <img v-if="addFormData.profileImage" :src="addFormData.profileImage" class="w-full h-full object-cover" />
            <IconUser v-else class="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Image</label>
            <button 
              @click="addStudentFileInput?.click()" 
              type="button"
              class="px-2.5 py-1 bg-white border border-slate-200 rounded-[3px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Choose Photo
            </button>
            <input 
              ref="addStudentFileInput" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="onAddStudentFileSelected" 
            />
          </div>
        </div>

        <!-- First and Last Name Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name *</label>
            <input 
              v-model="addFormData.firstName" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              :class="addFormErrors.firstName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="First name..."
            />
            <p v-if="addFormErrors.firstName" class="text-[9px] text-red-500 font-bold mt-0.5">{{ addFormErrors.firstName }}</p>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name *</label>
            <input 
              v-model="addFormData.lastName" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              :class="addFormErrors.lastName ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="Last name..."
            />
            <p v-if="addFormErrors.lastName" class="text-[9px] text-red-500 font-bold mt-0.5">{{ addFormErrors.lastName }}</p>
          </div>
        </div>

        <!-- Student Code & Phone Number -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Student Code *</label>
            <input 
              v-model="addFormData.studentCode" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              :class="addFormErrors.studentCode ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="e.g. PNC2025-001"
            />
            <p v-if="addFormErrors.studentCode" class="text-[9px] text-red-500 font-bold mt-0.5">{{ addFormErrors.studentCode }}</p>
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number *</label>
            <input 
              v-model="addFormData.phone" 
              type="text" 
              class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              :class="addFormErrors.phone ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
              placeholder="e.g. +855092..."
            />
            <p v-if="addFormErrors.phone" class="text-[9px] text-red-500 font-bold mt-0.5">{{ addFormErrors.phone }}</p>
          </div>
        </div>

        <!-- Gmail Address -->
        <div>
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gmail Address *</label>
          <input 
            v-model="addFormData.email" 
            type="email" 
            class="w-full rounded-[3px] border px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
            :class="addFormErrors.email ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-slate-400'"
            placeholder="Gmail address..."
          />
          <p v-if="addFormErrors.email" class="text-[9px] text-red-500 font-bold mt-0.5">{{ addFormErrors.email }}</p>
        </div>

        <!-- Place of Birth & Date of Birth -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Place of Birth</label>
            <input 
              v-model="addFormData.placeOfBirth" 
              type="text" 
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none bg-white"
              placeholder="Kampong Cham..."
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date of Birth</label>
            <CustomDatePicker 
              v-model="addFormData.dateOfBirth" 
              placeholder="Select date of birth..."
            />
          </div>
        </div>

        <!-- Gender, Class, Status dropdowns -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Gender -->
          <div class="relative custom-dropdown-addGender">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Gender</label>
            <button
              type="button"
              @click.stop="toggleDropdown('addGender', $event)"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px] custom-dropdown-addGender"
            >
              <span class="capitalize">{{ addFormData.gender }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isAddGenderOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="isAddGenderOpen"
                :style="dropdownStyles.addGender"
                class="bg-white border border-slate-100 shadow-lg rounded-[8px] z-[9999] py-1 custom-dropdown-addGender"
              >
                <button
                  v-for="g in ['male', 'female', 'other']"
                  :key="g"
                  type="button"
                  @click="addFormData.gender = g; closeAllDropdowns()"
                  class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors capitalize animate-none"
                  :class="{ 'text-[#ff9c07] bg-slate-50/50': addFormData.gender === g }"
                >
                  {{ g }}
                </button>
              </div>
            </Teleport>
          </div>

          <!-- Class -->
          <div class="relative custom-dropdown-addClass">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Class</label>
            <button
              type="button"
              @click.stop="toggleDropdown('addClass', $event)"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px] custom-dropdown-addClass"
            >
              <span>{{ classesStore.getName(addFormData.classId) || 'Select Class' }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isAddClassOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="isAddClassOpen"
                :style="dropdownStyles.addClass"
                class="bg-white border border-slate-100 shadow-lg rounded-[8px] z-[9999] py-1 max-h-[140px] overflow-y-auto custom-scroll-hidden custom-dropdown-addClass"
              >
                <button
                  v-for="c in classesStore.classes"
                  :key="c.id"
                  type="button"
                  @click="addFormData.classId = c.id; closeAllDropdowns()"
                  class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors animate-none"
                  :class="{ 'text-[#ff9c07] bg-slate-50/50': addFormData.classId === c.id }"
                >
                  {{ c.name }}
                </button>
              </div>
            </Teleport>
          </div>

          <!-- Status -->
          <div class="relative custom-dropdown-addStatus">
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
            <button
              type="button"
              @click.stop="toggleDropdown('addStatus', $event)"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[30px] custom-dropdown-addStatus"
            >
              <span class="capitalize">{{ addFormData.status }}</span>
              <svg class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isAddStatusOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Teleport to="body">
              <div
                v-if="isAddStatusOpen"
                :style="dropdownStyles.addStatus"
                class="bg-white border border-slate-100 shadow-lg rounded-[8px] z-[9999] py-1 custom-dropdown-addStatus"
              >
                <button
                  v-for="s in ['Active', 'Suspended', 'Graduated']"
                  :key="s"
                  type="button"
                  @click="addFormData.status = s; closeAllDropdowns()"
                  class="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#ff9c07] transition-colors capitalize animate-none"
                  :class="{ 'text-[#ff9c07] bg-slate-50/50': addFormData.status === s }"
                >
                  {{ s }}
                </button>
              </div>
            </Teleport>
          </div>
        </div>
      </div>

      <!-- Modal Footer (Save / Cancel) -->
      <div class="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
        <button 
          @click="closeAddModal"
          class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          @click="createStudent"
          class="rounded-[3px] bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
        >
          Add Student
        </button>
      </div>
    </div>
  </div>
</template>
