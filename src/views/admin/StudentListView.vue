<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, inject, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentsStore, type DisplayStudent } from '@/stores/students'
import { useClassesStore } from '@/stores/classes'
import BaseDropdown, { type DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import AddStudentModal from '@/components/students/AddStudentModal.vue'
import EditStudentModal from '@/components/students/EditStudentModal.vue'
import {
  IconSearch,
  IconPlus,
  IconUsers,
  IconUser,
  IconRefresh,
  IconCircleDot,
  IconEdit,
  IconCopy,
  IconTrash,
} from '@tabler/icons-vue'
import { getErrorMessage } from '@/services/api'
import type { CreateStudentPayload, UpdateStudentPayload } from '@/types/student'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const store = useStudentsStore()
const classesStore = useClassesStore()
const toastStore = useToastStore()

import { useDebounce } from '@/services/utils'

const rawSearchQuery = inject<Ref<string>>('searchQuery', ref(''))
const searchQuery = useDebounce(rawSearchQuery, 250)
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

// Modals state
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const editingStudent = ref<DisplayStudent | null>(null)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)
const isPageSizeOpen = ref(false)

// Dropdown styles for page size dropdown
const dropdownStyles = ref<Record<string, Record<string, string>>>({
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
  isPageSizeOpen.value = key === 'pageSize'
  activeDropdownKey.value = key
  activeTriggerEl = triggerEl
  updateDropdownPosition(key, triggerEl)
}

function closeAllDropdowns() {
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

function startEdit(student: DisplayStudent) {
  editingStudent.value = student
  isEditModalOpen.value = true
}

function closeEditModal() {
  editingStudent.value = null
  isEditModalOpen.value = false
}

function openAddModal() {
  isAddModalOpen.value = true
}

function closeAddModal() {
  isAddModalOpen.value = false
}

async function handleCreateStudent(payload: CreateStudentPayload, file: File | null) {
  try {
    await store.createStudent(payload, file)
    closeAddModal()
    toastStore.showToast('Student added successfully!')
  } catch (err: unknown) {
    toastStore.showToast(getErrorMessage(err, 'Failed to add student'), 'error')
  }
}

async function handleSaveStudent(payload: UpdateStudentPayload, file: File | null) {
  const studentData = editingStudent.value
  if (!studentData) return
  try {
    await store.updateStudent(studentData.id, payload, file)
    closeEditModal()
    toastStore.showToast('Student updated successfully!')
  } catch (err: unknown) {
    toastStore.showToast(getErrorMessage(err, 'Failed to update student'), 'error')
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
            v-model="rawSearchQuery"
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
                    <div class="relative w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                      <IconUser class="absolute inset-0 m-auto w-4 h-4 text-indigo-500" />
                      <img v-if="s.profileImage" :src="s.profileImage" @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" class="relative z-10 w-full h-full object-cover" />
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
                    <div class="flex items-center justify-end gap-0.5">
                      <button
                        @click="navigateProfile(s.id)"
                        class="p-1.5 rounded-[5px] text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title="View Profile"
                      >
                        <IconUser class="w-4 h-4" />
                      </button>
                      <button
                        @click="startEdit(s)"
                        class="p-1.5 rounded-[5px] text-slate-300 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Edit"
                      >
                        <IconEdit class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1.5 rounded-[5px] text-slate-300 hover:text-[#3b4b6b] hover:bg-slate-100 transition-all"
                        title="Copy"
                      >
                        <IconCopy class="w-4 h-4" />
                      </button>
                      <button
                        class="p-1.5 rounded-[5px] text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
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

  <!-- Modals -->
  <AddStudentModal
    :is-open="isAddModalOpen"
    :classes="classesStore.classes"
    @close="closeAddModal"
    @save="handleCreateStudent"
  />

  <EditStudentModal
    :is-open="isEditModalOpen"
    :student="editingStudent"
    :classes="classesStore.classes"
    @close="closeEditModal"
    @save="handleSaveStudent"
  />


</template>
