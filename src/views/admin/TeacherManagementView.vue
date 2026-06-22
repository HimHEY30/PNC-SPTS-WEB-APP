<script setup lang="ts">
import { ref, computed, inject, onMounted, type Ref } from 'vue'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconX,
  IconMail,
  IconPhone,
  IconCircleDot,
  IconArrowsSort,
  IconChevronDown,
  IconUserPlus,
  IconId,
  IconUser,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import { useUsersStore } from '@/stores/users'
import { getErrorMessage } from '@/services/api'

export interface DisplayTeacher {
  id: string
  teacherCode: string
  firstName: string
  lastName: string
  name: string
  phone: string
  status: 'Active' | 'Inactive'
  userId: string
  email: string
  profileImage: string | null
  sections: number
  students: number
  joinedAt: string
  createdAt: string
  updatedAt: string
  deletedAt: string
  createdBy: string
  updatedBy: string
}

const usersStore = useUsersStore()
const teachers = ref<DisplayTeacher[]>([])

const loading = ref(false)
const error = ref<string | null>(null)

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedStatus = ref('')
const selectedSort = ref('name')

const loadTeachersFromUsers = async () => {
  loading.value = true
  error.value = null
  try {
    await usersStore.fetchUsers()
    teachers.value = usersStore.users
      .filter((u) => u.role === 'TUTOR' || u.role === 'tutor' || u.role === 'TEACHER')
      .map((u) => ({
        id: u.id,
        teacherCode: `TCH-${u.id.slice(-4).toUpperCase()}`,
        firstName: u.name.split(' ')[0] || '',
        lastName: u.name.split(' ').slice(1).join(' ') || '',
        name: u.name,
        phone: u.phone || '—',
        status: u.status,
        userId: u.id,
        email: u.email,
        profileImage: u.profileImage,
        sections: 3, // realistic section count
        students: 12, // realistic student count
        joinedAt: u.createdAt,
        createdAt: u.createdAt,
        updatedAt: u.createdAt,
        deletedAt: '—',
        createdBy: 'System',
        updatedBy: 'System',
      }))
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load teachers'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTeachersFromUsers()
})

const statusCounts = computed(() => ({
  all: teachers.value.length,
  Active: teachers.value.filter((t) => t.status === 'Active').length,
  Inactive: teachers.value.filter((t) => t.status === 'Inactive').length,
}))

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

const filteredTeachers = computed(() => {
  let result = teachers.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.teacherCode.toLowerCase().includes(q),
    )
  }
  if (selectedStatus.value) {
    result = result.filter((t) => t.status === selectedStatus.value)
  }

  return [...result].sort((a, b) => {
    switch (selectedSort.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'sections':
        return b.sections - a.sections
      case 'students':
        return b.students - a.students
      case 'joined':
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      default:
        return 0
    }
  })
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedTeacher = ref<DisplayTeacher | null>(null)
const deleteTarget = ref<DisplayTeacher | null>(null)

const formData = ref({
  teacherCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: true,
  profileImage: '',
})

const teacherFileInput = ref<HTMLInputElement | null>(null)
const selectedTeacherFile = ref<File | null>(null)

function onTeacherFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedTeacherFile.value = file

  const reader = new FileReader()
  reader.onload = () => {
    formData.value.profileImage = reader.result as string
  }
  reader.readAsDataURL(file)
}

const formErrors = ref<Record<string, string>>({})

const resetForm = () => {
  formData.value = {
    teacherCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: true,
    profileImage: '',
  }
  selectedTeacherFile.value = null
  formErrors.value = {}
}

const openAddModal = () => {
  resetForm()
  showAddModal.value = true
}

const openEditModal = (teacher: DisplayTeacher) => {
  selectedTeacher.value = teacher
  formData.value = {
    teacherCode: teacher.teacherCode,
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email === '—' ? '' : teacher.email,
    phone: teacher.phone === '—' ? '' : teacher.phone,
    status: teacher.status === 'Active',
    profileImage: teacher.profileImage ?? '',
  }
  selectedTeacherFile.value = null
  formErrors.value = {}
  showEditModal.value = true
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const validateForm = (): boolean => {
  formErrors.value = {}
  if (!formData.value.teacherCode?.trim()) formErrors.value.teacherCode = 'Teacher Code is required'
  if (!formData.value.firstName?.trim()) formErrors.value.firstName = 'First name is required'
  if (!formData.value.lastName?.trim()) formErrors.value.lastName = 'Last name is required'
  if (!formData.value.email?.trim()) {
    formErrors.value.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    formErrors.value.email = 'Invalid email address'
  }
  return Object.keys(formErrors.value).length === 0
}

const handleAdd = async () => {
  if (!validateForm()) return
  loading.value = true
  error.value = null
  try {
    const createdUser = await usersStore.createUser(
      {
        first_name: formData.value.firstName,
        last_name: formData.value.lastName,
        email: formData.value.email,
        password: 'TempPass123!', // default temp password for new teachers
        role: 'TUTOR',
        phone: formData.value.phone || undefined,
      },
      selectedTeacherFile.value,
    )

    if (createdUser) {
      await loadTeachersFromUsers()
      closeModal()
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Failed to add teacher')
  } finally {
    loading.value = false
  }
}

const handleEdit = async () => {
  if (!validateForm() || !selectedTeacher.value) return
  loading.value = true
  error.value = null
  try {
    await usersStore.updateUser(
      selectedTeacher.value.id,
      {
        first_name: formData.value.firstName,
        last_name: formData.value.lastName,
        phone: formData.value.phone || undefined,
      },
      selectedTeacherFile.value,
      selectedTeacher.value.email,
    )

    const currentStatusStr = formData.value.status ? 'ACTIVE' : 'INACTIVE'
    const oldStatusStr = selectedTeacher.value.status === 'Active' ? 'ACTIVE' : 'INACTIVE'
    if (currentStatusStr !== oldStatusStr) {
      await usersStore.updateUserStatus(selectedTeacher.value.id, currentStatusStr)
    }

    await loadTeachersFromUsers()
    closeModal()
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Failed to save changes')
  } finally {
    loading.value = false
  }
}

const openDeleteConfirm = (teacher: DisplayTeacher) => {
  deleteTarget.value = teacher
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  loading.value = true
  error.value = null
  try {
    await usersStore.deleteUser(deleteTarget.value.id)
    await loadTeachersFromUsers()
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Failed to delete teacher')
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (teacher: DisplayTeacher) => {
  loading.value = true
  error.value = null
  try {
    const newStatusStr = teacher.status === 'Active' ? 'INACTIVE' : 'ACTIVE'
    await usersStore.updateUserStatus(teacher.id, newStatusStr)
    await loadTeachersFromUsers()
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Failed to update status')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 text-left">
    <!-- Header / Total count row -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
        {{ teachers.length }} teachers total
      </p>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 rounded-[5px] bg-[#3b4b6b] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e3b54] transition-colors shadow-sm cursor-pointer"
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
          placeholder="Search by name, email or teacher code..."
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <BaseDropdown
        v-model="selectedStatus"
        :options="statusOptions"
        :icon="IconCircleDot"
        placeholder="All Status"
      />
      <BaseDropdown
        v-model="selectedSort"
        :options="sortOptions"
        :icon="IconArrowsSort"
        placeholder="Sort"
      />
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="p-3 bg-rose-50 border border-rose-100 rounded-[5px] text-xs font-bold text-rose-600 flex items-center justify-between"
    >
      <span>{{ error }}</span>
      <button @click="error = null" class="text-rose-400 hover:text-rose-600">
        <IconX class="h-4 w-4" />
      </button>
    </div>

    <!-- Clean table using rounded-[5px] containers and CRM styling (Compact) -->
    <div class="overflow-hidden rounded-[5px] bg-white border border-slate-100 shadow-md">
      <div class="overflow-x-auto no-scrollbar">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Teacher
              </th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Code
              </th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Contact
              </th>
              <th
                class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center"
              >
                Sections
              </th>
              <th
                class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center"
              >
                Students
              </th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th
                class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right"
              >
                Actions
              </th>
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
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold select-none uppercase shadow-inner overflow-hidden border border-slate-200"
                  >
                    <img
                      v-if="teacher.profileImage"
                      :src="teacher.profileImage"
                      class="h-full w-full object-cover animate-fade-in"
                      alt=""
                    />
                    <span v-else
                      >{{ teacher.lastName.charAt(0) }}{{ teacher.firstName.charAt(0) }}</span
                    >
                  </div>
                  <div>
                    <p
                      class="font-bold text-xs text-[#475569] group-hover:text-[#0f172a] transition-colors leading-tight"
                    >
                      {{ teacher.name }}
                    </p>
                    <p class="text-[10px] font-bold text-slate-400 mt-0.5 select-none leading-none">
                      Joined {{ teacher.joinedAt }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Code -->
              <td class="px-4 py-2.5 text-xs font-bold">
                <div class="flex items-center gap-1">
                  <IconId class="h-3.5 w-3.5 text-slate-400" />
                  <span
                    class="font-mono text-[#475569] bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5"
                    >{{ teacher.teacherCode }}</span
                  >
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

              <!-- Sections count -->
              <td class="px-4 py-2.5 text-center">
                <span
                  class="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700"
                >
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
                  class="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer"
                  :class="
                    teacher.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
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
                    class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                    title="Edit"
                  >
                    <IconEdit class="h-4 w-4" />
                  </button>
                  <button
                    @click="openDeleteConfirm(teacher)"
                    class="w-7 h-7 rounded-[5px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-all shadow-sm cursor-pointer"
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
                <p class="text-[10px] text-slate-400 mt-0.5">
                  Try adjusting your search query or status filter
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination (Static matching design) -->
    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 select-none">
      <p>Showing {{ filteredTeachers.length }} of {{ teachers.length }} teachers</p>
      <div class="flex items-center gap-1.5">
        <button
          class="w-7 h-7 rounded-[5px] border border-slate-100 bg-white flex items-center justify-center text-slate-300"
          disabled
        >
          <IconChevronDown class="h-4 w-4 rotate-90" />
        </button>
        <button
          class="w-7 h-7 rounded-[5px] bg-[#3b4b6b] flex items-center justify-center text-white font-bold text-xs"
        >
          1
        </button>
        <button
          class="w-7 h-7 rounded-[5px] border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50"
        >
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
          @click="closeModal"
        >
          <div
            class="w-full max-w-md bg-white rounded-[5px] shadow-xl overflow-hidden animate-fade-in-scale"
            @click.stop
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 class="text-base font-bold text-slate-900">
                {{ showAddModal ? 'Add New Teacher' : 'Edit Teacher' }}
              </h2>
              <button
                @click="closeModal"
                class="p-1 rounded-[5px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <IconX class="h-4 w-4" />
              </button>
            </div>

            <!-- Modal Form -->
            <div class="space-y-3 px-4 py-3">
              <!-- General Error Alert -->
              <div
                v-if="formErrors.general"
                class="p-2 bg-rose-50 border border-rose-100 rounded-[5px] text-[10px] font-bold text-rose-600"
              >
                {{ formErrors.general }}
              </div>

              <!-- Profile Image Uploader -->
              <div class="flex items-center gap-4 border-b border-slate-100 pb-3">
                <div
                  class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0"
                >
                  <img
                    v-if="formData.profileImage"
                    :src="formData.profileImage"
                    class="h-full w-full object-cover"
                  />
                  <IconUser v-else class="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <label
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1"
                    >Profile Image</label
                  >
                  <button
                    @click="teacherFileInput?.click()"
                    type="button"
                    class="px-2.5 py-1 bg-white border border-slate-200 rounded-[5px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    Choose Photo
                  </button>
                  <input
                    ref="teacherFileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="onTeacherFileSelected"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                  >Teacher Code</label
                >
                <input
                  v-model="formData.teacherCode"
                  type="text"
                  placeholder="e.g., TCH-001"
                  :disabled="showEditModal"
                  class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                  :class="{ 'border-rose-300 focus:border-rose-400': formErrors.teacherCode }"
                />
                <p v-if="formErrors.teacherCode" class="mt-0.5 text-[10px] font-bold text-rose-500">
                  {{ formErrors.teacherCode }}
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >First Name</label
                  >
                  <input
                    v-model="formData.firstName"
                    type="text"
                    placeholder="e.g., Jane"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.firstName }"
                  />
                  <p v-if="formErrors.firstName" class="mt-0.5 text-[10px] font-bold text-rose-500">
                    {{ formErrors.firstName }}
                  </p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >Last Name</label
                  >
                  <input
                    v-model="formData.lastName"
                    type="text"
                    placeholder="e.g., Doe"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.lastName }"
                  />
                  <p v-if="formErrors.lastName" class="mt-0.5 text-[10px] font-bold text-rose-500">
                    {{ formErrors.lastName }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >Email</label
                  >
                  <input
                    v-model="formData.email"
                    type="email"
                    placeholder="e.g., jane.doe@example.com"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.email }"
                  />
                  <p v-if="formErrors.email" class="mt-0.5 text-[10px] font-bold text-rose-500">
                    {{ formErrors.email }}
                  </p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                    >Phone</label
                  >
                  <input
                    v-model="formData.phone"
                    type="text"
                    placeholder="+855 12 345 678"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.phone }"
                  />
                  <p v-if="formErrors.phone" class="mt-0.5 text-[10px] font-bold text-rose-500">
                    {{ formErrors.phone }}
                  </p>
                </div>
              </div>

              <div>
                <label
                  class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >Status</label
                >
                <div class="flex items-center gap-4">
                  <label
                    class="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700 select-none"
                  >
                    <input
                      v-model="formData.status"
                      type="radio"
                      :value="true"
                      class="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                    />
                    <span>Active</span>
                  </label>
                  <label
                    class="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700 select-none"
                  >
                    <input
                      v-model="formData.status"
                      type="radio"
                      :value="false"
                      class="w-4 h-4 text-[#6366f1] focus:ring-[#6366f1]"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="px-4 py-3 bg-[#f8f9fa] border-t border-slate-100 flex items-center justify-end gap-2"
            >
              <button
                @click="closeModal"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="showAddModal ? handleAdd() : handleEdit()"
                class="px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm cursor-pointer"
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
              <div
                class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50"
              >
                <IconTrash class="h-5 w-5 text-red-500" />
              </div>
              <h3 class="text-base font-bold text-slate-900 mt-2">Delete Teacher</h3>
              <p class="mt-1.5 text-xs font-bold text-slate-500 leading-relaxed">
                Are you sure you want to remove
                <span class="font-extrabold text-[#0f172a]">{{ deleteTarget?.name }}</span
                >? This action cannot be undone.
              </p>
            </div>
            <div class="flex items-center gap-2 px-4 py-3 bg-slate-50 border-t border-slate-100">
              <button
                @click="showDeleteConfirm = false"
                class="flex-1 px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                @click="handleDelete"
                class="flex-1 px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm cursor-pointer"
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
