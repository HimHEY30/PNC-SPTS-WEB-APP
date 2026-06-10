<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconMail,
  IconPhone,
  IconBooks,
  IconCategory,
  IconCircleDot,
  IconArrowsSort,
  IconChevronDown,
  IconUserPlus,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

interface Teacher {
  id: number
  name: string
  email: string
  phone: string
  department: string
  sections: number
  students: number
  status: 'Active' | 'Inactive'
  joinedAt: string
}

const teachers = ref<Teacher[]>([
  { id: 1, name: 'Ms. Chantrea Keo', email: 'chantrea.k@pnc.edu.kh', phone: '+855 12 345 678', department: 'Web Development', sections: 3, students: 72, status: 'Active', joinedAt: '2025-01-15' },
  { id: 2, name: 'Mr. Dara Heng', email: 'dara.h@pnc.edu.kh', phone: '+855 98 765 432', department: 'Data Science', sections: 2, students: 48, status: 'Active', joinedAt: '2025-03-01' },
  { id: 3, name: 'Ms. Theary Sok', email: 'theary.s@pnc.edu.kh', phone: '+855 77 123 456', department: 'Mobile Dev', sections: 2, students: 54, status: 'Active', joinedAt: '2024-08-20' },
  { id: 4, name: 'Mr. Vuthy Long', email: 'vuthy.l@pnc.edu.kh', phone: '+855 92 334 556', department: 'Web Development', sections: 2, students: 51, status: 'Inactive', joinedAt: '2023-06-10' },
  { id: 5, name: 'Ms. Kanha Phan', email: 'kanha.p@pnc.edu.kh', phone: '+855 81 445 667', department: 'DevOps', sections: 1, students: 28, status: 'Active', joinedAt: '2025-09-01' },
  { id: 6, name: 'Mr. Samnang Tep', email: 'samnang.t@pnc.edu.kh', phone: '+855 15 556 778', department: 'Cyber Security', sections: 2, students: 44, status: 'Active', joinedAt: '2024-11-15' },
  { id: 7, name: 'Mr. Rithy Chhum', email: 'rithy.c@pnc.edu.kh', phone: '+855 96 667 889', department: 'Data Science', sections: 1, students: 23, status: 'Active', joinedAt: '2026-01-05' },
  { id: 8, name: 'Ms. Socheata Lim', email: 'socheata.l@pnc.edu.kh', phone: '+855 88 778 990', department: 'AI & ML', sections: 2, students: 36, status: 'Inactive', joinedAt: '2024-05-20' },
])

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedDepartment = ref('')
const selectedStatus = ref('')
const selectedSort = ref('name')

const uniqueDepartments = computed(() => [...new Set(teachers.value.map(t => t.department))])

const deptCounts = computed(() => {
  const counts: Record<string, number> = { all: teachers.value.length }
  teachers.value.forEach(t => {
    counts[t.department] = (counts[t.department] || 0) + 1
  })
  return counts
})

const deptOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Departments', count: deptCounts.value.all },
  ...uniqueDepartments.value.map(d => ({ value: d, label: d, count: deptCounts.value[d] })),
])

const statusOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Status', count: statusCounts.value.all },
  { value: 'Active', label: 'Active', count: statusCounts.value.Active },
  { value: 'Inactive', label: 'Inactive', count: statusCounts.value.Inactive },
])

const sortOptions: DropdownOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'sections', label: 'Sections' },
  { value: 'students', label: 'Students' },
  { value: 'joined', label: 'Join Date' },
]

const statusCounts = computed(() => ({
  all: teachers.value.length,
  Active: teachers.value.filter(t => t.status === 'Active').length,
  Inactive: teachers.value.filter(t => t.status === 'Inactive').length,
}))

const filteredTeachers = computed(() => {
  let result = teachers.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))
  }
  if (selectedDepartment.value) {
    result = result.filter(t => t.department === selectedDepartment.value)
  }
  if (selectedStatus.value) {
    result = result.filter(t => t.status === selectedStatus.value)
  }

  return [...result].sort((a, b) => {
    switch (selectedSort.value) {
      case 'name': return a.name.localeCompare(b.name)
      case 'sections': return b.sections - a.sections
      case 'students': return b.students - a.students
      case 'joined': return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      default: return 0
    }
  })
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedTeacher = ref<Teacher | null>(null)
const deleteTarget = ref<Teacher | null>(null)

const formData = ref<Partial<Teacher>>({
  name: '',
  email: '',
  phone: '',
  department: '',
  sections: 0,
  status: 'Active',
})

const formErrors = ref<Record<string, string>>({})

const resetForm = () => {
  formData.value = { name: '', email: '', phone: '', department: '', sections: 0, status: 'Active' }
  formErrors.value = {}
}

const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

const openEditModal = (teacher: Teacher) => {
  selectedTeacher.value = teacher
  formData.value = { ...teacher }
  formErrors.value = {}
  showEditModal.value = true
}

const validateForm = (): boolean => {
  formErrors.value = {}
  if (!formData.value.name?.trim()) formErrors.value.name = 'Name is required'
  if (!formData.value.email?.trim()) formErrors.value.email = 'Email is required'
  if (!formData.value.phone?.trim()) formErrors.value.phone = 'Phone is required'
  if (!formData.value.department?.trim()) formErrors.value.department = 'Department is required'
  return Object.keys(formErrors.value).length === 0
}

const handleAdd = () => {
  if (!validateForm()) return
  teachers.value.push({
    id: Date.now(),
    name: formData.value.name!,
    email: formData.value.email!,
    phone: formData.value.phone!,
    department: formData.value.department!,
    sections: formData.value.sections || 0,
    students: 0,
    status: formData.value.status as 'Active' | 'Inactive',
    joinedAt: new Date().toISOString().split('T')[0],
  })
  showAddModal.value = false
}

const handleEdit = () => {
  if (!validateForm() || !selectedTeacher.value) return
  const idx = teachers.value.findIndex(t => t.id === selectedTeacher.value!.id)
  if (idx !== -1) {
    teachers.value[idx] = {
      ...teachers.value[idx],
      name: formData.value.name!,
      email: formData.value.email!,
      phone: formData.value.phone!,
      department: formData.value.department!,
      sections: formData.value.sections || 0,
      status: formData.value.status as 'Active' | 'Inactive',
    }
  }
  showEditModal.value = false
}

const openDeleteConfirm = (teacher: Teacher) => {
  deleteTarget.value = teacher
  showDeleteConfirm.value = true
}

const handleDelete = () => {
  if (!deleteTarget.value) return
  teachers.value = teachers.value.filter(t => t.id !== deleteTarget.value!.id)
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

const toggleStatus = (teacher: Teacher) => {
  teacher.status = teacher.status === 'Active' ? 'Inactive' : 'Active'
}
</script>

<template>
  <div class="space-y-6 text-left">
    <!-- Header / Total count row -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{{ teachers.length }} teachers total</p>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 rounded-[5px] bg-[#3b4b6b] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e3b54] transition-colors shadow-sm"
      >
        <IconPlus class="h-4 w-4" />
        Add Teacher
      </button>
    </div>

    <!-- Filters and Searches toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search bar -->
      <div class="relative flex-1 min-w-[280px] max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <BaseDropdown v-model="selectedDepartment" :options="deptOptions" :icon="IconCategory" placeholder="All Departments" />
      <BaseDropdown v-model="selectedStatus" :options="statusOptions" :icon="IconCircleDot" placeholder="All Status" />
      <BaseDropdown v-model="selectedSort" :options="sortOptions" :icon="IconArrowsSort" placeholder="Sort" />
    </div>

    <!-- Clean table using rounded-[5px] containers and CRM styling (Compact) -->
    <div class="overflow-hidden rounded-[5px] bg-white border border-slate-100 shadow-md">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Sections</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Students</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="teacher in filteredTeachers"
              :key="teacher.id"
              class="group hover:bg-slate-50/50 transition-colors"
            >
              <!-- Name & join date details -->
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold select-none uppercase shadow-inner">
                    {{ teacher.name.split(' ').slice(-1)[0]?.charAt(0) }}{{ teacher.name.split(' ').slice(-1)[0]?.charAt(1) }}
                  </div>
                  <div>
                    <p class="font-bold text-xs text-[#475569] group-hover:text-[#0f172a] transition-colors leading-tight">
                      {{ teacher.name }}
                    </p>
                    <p class="text-[10px] font-bold text-slate-400 mt-0.5 select-none leading-none">Joined {{ teacher.joinedAt }}</p>
                  </div>
                </div>
              </td>
              
              <!-- Contact details -->
              <td class="px-4 py-2.5 text-xs font-bold text-slate-500">
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5">
                    <IconMail class="h-3.5 w-3.5 text-slate-400" />
                    <span>{{ teacher.email }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <IconPhone class="h-3.5 w-3.5 text-slate-400" />
                    <span>{{ teacher.phone }}</span>
                  </div>
                </div>
              </td>
 
              <!-- Department -->
              <td class="px-4 py-2.5 text-xs font-bold text-[#475569]">
                <div class="flex items-center gap-1.5">
                  <IconBooks class="h-3.5 w-3.5 text-slate-400" />
                  <span>{{ teacher.department }}</span>
                </div>
              </td>
 
              <!-- Sections count -->
              <td class="px-4 py-2.5 text-center">
                <span class="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                  {{ teacher.sections }}
                </span>
              </td>
 
              <!-- Students count -->
              <td class="px-4 py-2.5 text-center">
                <span class="text-xs font-bold text-[#475569]">{{ teacher.students }}</span>
              </td>
 
              <!-- Active Status toggle -->
              <td class="px-4 py-2.5">
                <button
                  @click="toggleStatus(teacher)"
                  class="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all select-none"
                  :class="
                    teacher.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="teacher.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-400'"
                  />
                  {{ teacher.status }}
                </button>
              </td>
 
              <!-- Edit/Delete actions -->
              <td class="px-4 py-2.5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="openEditModal(teacher)"
                    class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                    title="Edit"
                  >
                    <IconEdit class="h-4 w-4" />
                  </button>
                  <button
                    @click="openDeleteConfirm(teacher)"
                    class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all shadow-sm"
                    title="Delete"
                  >
                    <IconTrash class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
 
            <tr v-if="filteredTeachers.length === 0">
              <td colspan="7" class="px-4 py-12 text-center">
                <IconUserPlus class="mx-auto h-10 w-10 text-slate-300" />
                <p class="mt-2 text-xs font-bold text-slate-500">No teachers found</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Try adjusting your search query or dropdown filters</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
 
    <!-- Pagination -->
    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 select-none">
      <p>Showing {{ filteredTeachers.length }} of {{ teachers.length }} teachers</p>
      <div class="flex items-center gap-1.5">
        <button class="w-7 h-7 rounded-[5px] border border-slate-100 bg-white flex items-center justify-center text-slate-300" disabled>
          <IconChevronDown class="h-4 w-4 rotate-90" />
        </button>
        <button class="w-7 h-7 rounded-[5px] bg-[#3b4b6b] flex items-center justify-center text-white font-bold text-xs">1</button>
        <button class="w-7 h-7 rounded-[5px] border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 text-xs font-bold">2</button>
        <button class="w-7 h-7 rounded-[5px] border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50">
          <IconChevronDown class="h-4 w-4 -rotate-90" />
        </button>
      </div>
    </div>

    <!-- Add/Edit Teacher Modal -->
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
          v-if="showAddModal || showEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click="showAddModal = false; showEditModal = false"
        >
          <div
            class="w-full max-w-md bg-white rounded-[5px] shadow-xl overflow-hidden"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <h2 class="text-base font-bold text-slate-900">
                {{ showAddModal ? 'Add New Teacher' : 'Edit Teacher' }}
              </h2>
              <button
                @click="showAddModal = false; showEditModal = false"
                class="p-1 rounded-[5px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <IconX class="h-4 w-4" />
              </button>
            </div>

            <!-- Modal Form -->
            <div class="space-y-3 px-4 py-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input
                  v-model="formData.name"
                  type="text"
                  placeholder="e.g., Ms. Chantrea Keo"
                  class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                  :class="{ 'border-rose-300 focus:border-rose-400': formErrors.name }"
                />
                <p v-if="formErrors.name" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.name }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    placeholder="teacher@pnc.edu.kh"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.email }"
                  />
                  <p v-if="formErrors.email" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.email }}</p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    placeholder="+855 12 345 678"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.phone }"
                  />
                  <p v-if="formErrors.phone" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.phone }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <input
                    v-model="formData.department"
                    type="text"
                    placeholder="e.g., Web Development"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.department }"
                  />
                  <p v-if="formErrors.department" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.department }}</p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sections</label>
                  <input
                    v-model.number="formData.sections"
                    type="number"
                    min="0"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <div class="flex items-center gap-4">
                  <label class="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700">
                    <input
                      v-model="formData.status"
                      type="radio"
                      value="Active"
                      class="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                    />
                    <span>Active</span>
                  </label>
                  <label class="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700">
                    <input
                      v-model="formData.status"
                      type="radio"
                      value="Inactive"
                      class="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-4 py-3 bg-[#f8f9fa] border-t border-slate-50 flex items-center justify-end gap-2">
              <button
                @click="showAddModal = false; showEditModal = false"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                @click="showAddModal ? handleAdd() : handleEdit()"
                class="px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
              >
                {{ showAddModal ? 'Add Teacher' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click="showDeleteConfirm = false"
        >
          <div class="w-full max-w-sm bg-white rounded-[5px] shadow-xl overflow-hidden" @click.stop>
            <div class="px-4 py-4 text-center">
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <IconTrash class="h-5 w-5 text-red-500" />
              </div>
              <h3 class="text-base font-bold text-slate-900">Delete Teacher</h3>
              <p class="mt-1.5 text-xs font-bold text-slate-500 leading-relaxed">
                Are you sure you want to remove
                <span class="font-extrabold text-[#0f172a]">{{ deleteTarget?.name }}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100">
              <button
                @click="showDeleteConfirm = false"
                class="flex-1 px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                class="flex-1 px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
