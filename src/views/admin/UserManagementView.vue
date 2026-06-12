<script setup lang="ts">
import { ref, computed, inject, onMounted, type Ref } from 'vue'
import {
  IconSearch,
  IconPlus,
  IconEdit,

  IconX,
  IconMail,
  IconUser,
  IconShield,
  IconClock,
  IconArrowsSort,
  IconChevronDown,
  IconUsers,
  IconLoader2,
  IconRefresh,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import { useUsersStore, type DisplayUser } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/services/api'

const store = useUsersStore()
const auth = useAuthStore()

onMounted(() => {
  if (auth.isAuthenticated) {
    if (store.users.length === 0) store.fetchUsers()
    store.fetchRoles()
  }
})

const searchQuery = inject<Ref<string>>('searchQuery', ref(''))
const selectedRole = ref('')
const selectedStatus = ref('')
const selectedSort = ref('name')

const uniqueRoles = computed(() => [...new Set(store.users.map(u => u.role))])

const roleCounts = computed(() => {
  const counts: Record<string, number> = { all: store.users.length }
  store.users.forEach(u => {
    counts[u.role] = (counts[u.role] || 0) + 1
  })
  return counts
})

const roleOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Roles', count: roleCounts.value.all },
  ...uniqueRoles.value.map(r => ({ value: r, label: r, count: roleCounts.value[r] })),
])

const statusOptions = computed<DropdownOption[]>(() => [
  { value: '', label: 'All Status', count: statusCounts.value.all },
  { value: 'Active', label: 'Active', count: statusCounts.value.Active },
  { value: 'Inactive', label: 'Inactive', count: statusCounts.value.Inactive },
])

const sortOptions: DropdownOption[] = [
  { value: 'name', label: 'Name' },
  { value: 'role', label: 'Role' },
  { value: 'created', label: 'Created Date' },
  { value: 'lastLogin', label: 'Last Login' },
]

const statusCounts = computed(() => ({
  all: store.users.length,
  Active: store.users.filter(u => u.status === 'Active').length,
  Inactive: store.users.filter(u => u.status === 'Inactive').length,
}))

const filteredUsers = computed(() => {
  let result = store.users

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
  }
  if (selectedRole.value) {
    result = result.filter(u => u.role === selectedRole.value)
  }
  if (selectedStatus.value) {
    result = result.filter(u => u.status === selectedStatus.value)
  }

  return [...result].sort((a, b) => {
    switch (selectedSort.value) {
      case 'name': return a.name.localeCompare(b.name)
      case 'role': return a.role.localeCompare(b.role)
      case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'lastLogin': return b.lastLogin.localeCompare(a.lastLogin)
      default: return 0
    }
  })
})

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedUser = ref<DisplayUser | null>(null)
const deleteTarget = ref<DisplayUser | null>(null)

const formData = ref({
  first_name: '',
  last_name: '',
  password: '',
  email: '',
  phone: '',
  role: '',
  status: 'Active' as 'Active' | 'Inactive',
  profileImage: '',
})

const isRoleDropdownOpen = ref(false)
const userFileInput = ref<HTMLInputElement | null>(null)
const selectedUserFile = ref<File | null>(null)

function onUserFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedUserFile.value = file
  
  const reader = new FileReader()
  reader.onload = () => {
    formData.value.profileImage = reader.result as string
  }
  reader.readAsDataURL(file)
}

const formErrors = ref<Record<string, string>>({})
const saving = ref(false)
const toggleLoading = ref<string | null>(null)

const success = ref('')
let successTimer: ReturnType<typeof setTimeout> | null = null

function showSuccess(msg: string) {
  if (successTimer) clearTimeout(successTimer)
  success.value = msg
  successTimer = setTimeout(() => {
    success.value = ''
  }, 4000)
}

const resetForm = () => {
  const defaultRole = store.rolesList[0]?.name ?? ''
  formData.value = { first_name: '', last_name: '', password: '', email: '', phone: '', role: defaultRole, status: 'Active', profileImage: '' }
  selectedUserFile.value = null
  isRoleDropdownOpen.value = false
  formErrors.value = {}
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resetForm()
}

const savingRoles = ref(false)

const openAddModal = async () => {
  if (store.rolesList.length === 0) {
    savingRoles.value = true
    await store.fetchRoles()
    savingRoles.value = false
  }
  resetForm()
  showAddModal.value = true
}

const openEditModal = async (user: DisplayUser) => {
  if (store.rolesList.length === 0) {
    savingRoles.value = true
    await store.fetchRoles()
    savingRoles.value = false
  }
  selectedUser.value = user
  const parts = user.name.split(' ')
  formData.value = {
    first_name: parts[0] ?? '',
    last_name: parts.slice(1).join(' '),
    password: '',
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    profileImage: user.profileImage ?? '',
  }
  selectedUserFile.value = null
  isRoleDropdownOpen.value = false
  formErrors.value = {}
  showEditModal.value = true
}

const validateForm = (): boolean => {
  formErrors.value = {}
  if (!formData.value.first_name?.trim()) formErrors.value.first_name = 'First name is required'
  if (!formData.value.last_name?.trim()) formErrors.value.last_name = 'Last name is required'
  if (!formData.value.email?.trim()) formErrors.value.email = 'Email is required'
  if (showAddModal.value && !formData.value.password) formErrors.value.password = 'Password is required'
  if (!formData.value.role) formErrors.value.role = 'Role is required'
  return Object.keys(formErrors.value).length === 0
}

const handleAdd = async () => {
  if (!validateForm()) return
  saving.value = true
  try {
    await store.createUser(
      {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role,
        phone: formData.value.phone,
      },
      selectedUserFile.value
    )
    closeModal()
    showSuccess('User created successfully')
  } catch (e: unknown) {
    formErrors.value.api = getErrorMessage(e, 'Failed to create user')
  } finally {
    saving.value = false
  }
}

const handleEdit = async () => {
  if (!validateForm() || !selectedUser.value) return
  saving.value = true
  try {
    await store.updateUser(
      selectedUser.value.id,
      {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        phone: formData.value.phone,
      },
      selectedUserFile.value,
      selectedUser.value.email
    )
    if (formData.value.role !== selectedUser.value.role) {
      await store.assignRole(selectedUser.value.id, formData.value.role)
    }
    if (formData.value.status !== selectedUser.value.status) {
      const newStatus = formData.value.status === 'Active' ? 'ACTIVE' : 'INACTIVE'
      await store.updateUserStatus(selectedUser.value.id, newStatus)
    }
    closeModal()
    showSuccess('User updated successfully')
  } catch (e: unknown) {
    formErrors.value.api = getErrorMessage(e, 'Failed to update user')
  } finally {
    saving.value = false
  }
}

const openDeleteConfirm = (user: DisplayUser) => {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!deleteTarget.value) return
  saving.value = true
  try {
    await store.deleteUser(deleteTarget.value.id)
    showDeleteConfirm.value = false
    deleteTarget.value = null
    showSuccess('User deleted successfully')
  } catch (e: unknown) {
    formErrors.value.api = getErrorMessage(e, 'Failed to delete user')
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (user: DisplayUser) => {
  toggleLoading.value = user.id
  try {
    const newStatus = user.status === 'Active' ? 'INACTIVE' : 'ACTIVE'
    await store.updateUserStatus(user.id, newStatus)
    showSuccess(`User status updated to ${user.status === 'Active' ? 'Inactive' : 'Active'}`)
  } catch {
    // re-fetch on failure to reset optimistic state
    await store.fetchUsers()
  } finally {
    toggleLoading.value = null
  }
}

const roleBadgeClass = (role: string) => {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-100'
    case 'ACADEMIC_MANAGER':
    case 'MANAGER': return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'FOLLOWUP_OFFICER':
    case 'STAFF': return 'bg-rose-50 text-rose-700 border-rose-100'
    case 'TUTOR': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'STUDENT': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    default: return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}
</script>

<template>
  <div class="space-y-6 text-left">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{{ store.users.length }} users total</p>
        <IconLoader2 v-if="store.loading" class="h-3.5 w-3.5 text-slate-400 animate-spin" />
        <button
          v-if="auth.isAuthenticated"
          @click="store.fetchUsers()"
          class="w-6 h-6 rounded-[3px] border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          title="Refresh"
        >
          <IconRefresh class="h-3.5 w-3.5" />
        </button>
      </div>

      <div class="flex items-center gap-3">
        <!-- Success Banner -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 translate-x-4"
        >
          <div v-if="success" class="rounded-[5px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-emerald-600"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg>
            <span class="font-bold text-[11px]">{{ success }}</span>
          </div>
        </Transition>

        <button
          @click="openAddModal"
          :disabled="savingRoles"
          class="inline-flex items-center gap-2 rounded-[5px] bg-[#3b4b6b] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e3b54] transition-colors shadow-sm disabled:opacity-50"
        >
          <IconLoader2 v-if="savingRoles" class="h-4 w-4 animate-spin" />
          <IconPlus v-else class="h-4 w-4" />
          {{ savingRoles ? 'Loading...' : 'Add User' }}
        </button>
      </div>
    </div>

    <div v-if="store.error" class="rounded-[5px] bg-rose-50 border border-rose-200 px-4 py-2.5">
      <p class="text-xs font-bold text-rose-600">{{ store.error }}</p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative flex-1 min-w-[280px] max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, username, or email..."
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-8 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          title="Clear search"
        >
          <IconX class="w-3.5 h-3.5" />
        </button>
      </div>

      <BaseDropdown v-model="selectedRole" :options="roleOptions" :icon="IconShield" placeholder="All Roles" />
      <BaseDropdown v-model="selectedStatus" :options="statusOptions" :icon="IconUser" placeholder="All Status" />
      <BaseDropdown v-model="selectedSort" :options="sortOptions" :icon="IconArrowsSort" placeholder="Sort" />

      <button
        v-if="searchQuery || selectedRole || selectedStatus"
        @click="searchQuery = ''; selectedRole = ''; selectedStatus = ''"
        class="text-xs font-bold text-[#3b4b6b] hover:text-[#2e3b54] transition-colors px-2 py-1.5 rounded-[5px] hover:bg-slate-100/50"
      >
        Clear Filters
      </button>
    </div>

    <div class="overflow-hidden rounded-[5px] bg-white border border-slate-100 shadow-md">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Username</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Login</th>
              <th class="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="group hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-bold select-none uppercase shadow-inner overflow-hidden"
                  >
                    <img v-if="user.profileImage" :src="user.profileImage" class="h-full w-full object-cover" alt="" />
                    <span v-else>{{ user.name.charAt(0) }}{{ user.name.split(' ').slice(-1)[0]?.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-xs text-[#475569] group-hover:text-[#0f172a] transition-colors leading-tight">
                      {{ user.name }}
                    </p>
                    <div class="flex items-center gap-1 mt-0.5">
                      <IconMail class="h-3 w-3 text-slate-400" />
                      <p class="text-[10px] font-bold text-slate-400 leading-none">{{ user.email }}</p>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-2.5">
                <div class="flex items-center gap-1.5">
                  <IconUser class="h-3.5 w-3.5 text-slate-400" />
                  <span class="text-xs font-bold text-[#475569]">{{ user.username }}</span>
                </div>
              </td>

              <td class="px-4 py-2.5">
                <span
                  class="inline-flex items-center rounded-[3px] px-2.5 py-0.5 text-[10px] font-bold border"
                  :class="roleBadgeClass(user.role)"
                >
                  {{ user.role }}
                </span>
              </td>

              <td class="px-4 py-2.5">
                <button
                  @click="toggleStatus(user)"
                  :disabled="toggleLoading === user.id"
                  class="inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all select-none disabled:opacity-60"
                  :class="
                    user.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500'
                  "
                >
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="user.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-400'"
                  />
                  <IconLoader2 v-if="toggleLoading === user.id" class="h-3 w-3 animate-spin" />
                  <template v-else>{{ user.status }}</template>
                </button>
              </td>

              <td class="px-4 py-2.5">
                <div class="flex items-center gap-1.5">
                  <IconClock class="h-3.5 w-3.5 text-slate-400" />
                  <span class="text-xs font-bold text-[#475569]">{{ user.lastLogin }}</span>
                </div>
              </td>

              <td class="px-4 py-2.5 text-right">
                <div class="flex items-center justify-end gap-0.5">
                  <button
                    @click="openEditModal(user)"
                    class="p-1.5 rounded-[5px] text-slate-300 hover:text-amber-600 hover:bg-amber-50 transition-all"
                    title="Edit"
                  >
                    <IconEdit class="h-4 w-4" />
                  </button>
                  <button
                    @click="openDeleteConfirm(user)"
                    class="p-1.5 rounded-[5px] text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!store.loading && filteredUsers.length === 0 && !auth.isAuthenticated">
              <td colspan="6" class="px-4 py-12 text-center">
                <IconUsers class="mx-auto h-10 w-10 text-slate-300" />
                <p class="mt-2 text-xs font-bold text-slate-500">Sign in to manage users</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Please log in with an admin account to view and manage system users</p>
              </td>
            </tr>
            <tr v-if="!store.loading && filteredUsers.length === 0 && auth.isAuthenticated">
              <td colspan="6" class="px-4 py-12 text-center">
                <IconUsers class="mx-auto h-10 w-10 text-slate-300" />
                <p class="mt-2 text-xs font-bold text-slate-500">No users found</p>
                <p class="text-[10px] text-slate-400 mt-0.5">Try adjusting your search query or dropdown filters</p>
              </td>
            </tr>

            <tr v-if="store.loading && store.users.length === 0">
              <td colspan="6" class="px-4 py-12 text-center">
                <IconLoader2 class="mx-auto h-8 w-8 text-slate-300 animate-spin" />
                <p class="mt-2 text-xs font-bold text-slate-500">Loading users...</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 select-none">
      <p>Showing {{ filteredUsers.length }} of {{ store.users.length }} users</p>
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
            class="w-full max-w-md bg-white rounded-[5px] shadow-xl"
            @click.stop
          >
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-50 rounded-t-[5px]">
              <h2 class="text-base font-bold text-slate-900">
                {{ showAddModal ? 'Add New User' : 'Edit User' }}
              </h2>
              <button
                @click="closeModal"
                class="p-1 rounded-[5px] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <IconX class="h-4 w-4" />
              </button>
            </div>

            <div class="space-y-3 px-4 py-3">
              <p v-if="formErrors.api" class="rounded-[3px] bg-rose-50 border border-rose-200 px-3 py-1.5 text-[10px] font-bold text-rose-600">{{ formErrors.api }}</p>

              <!-- Profile Image Uploader -->
              <div class="flex items-center gap-4 border-b border-slate-50 pb-3">
                <div class="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="formData.profileImage" :src="formData.profileImage" class="h-full w-full object-cover" />
                  <IconUser v-else class="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Image</label>
                  <button 
                    @click="userFileInput?.click()" 
                    type="button"
                    class="px-2.5 py-1 bg-white border border-slate-200 rounded-[3px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Choose Photo
                  </button>
                  <input 
                    ref="userFileInput" 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="onUserFileSelected" 
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                  <input
                    v-model="formData.first_name"
                    type="text"
                    placeholder="e.g., John"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.first_name }"
                  />
                  <p v-if="formErrors.first_name" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.first_name }}</p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                  <input
                    v-model="formData.last_name"
                    type="text"
                    placeholder="e.g., Doe"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.last_name }"
                  />
                  <p v-if="formErrors.last_name" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.last_name }}</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    placeholder="user@pnc.edu.kh"
                    :disabled="!showAddModal"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.email }"
                  />
                  <p v-if="formErrors.email" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.email }}</p>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                  <input
                    v-model="formData.phone"
                    type="text"
                    placeholder="+855..."
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <!-- If ADD, show Password & Role row -->
              <div v-if="showAddModal" class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <input
                    v-model="formData.password"
                    type="password"
                    placeholder="Min 8 chars"
                    class="mt-1 w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.password }"
                  />
                  <p v-if="formErrors.password" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.password }}</p>
                </div>
                <div class="relative custom-dropdown-role" v-click-outside="() => isRoleDropdownOpen = false">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                  <button
                    type="button"
                    @click.stop="isRoleDropdownOpen = !isRoleDropdownOpen"
                    class="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[32px] focus:outline-none focus:border-purple-300 transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.role }"
                  >
                    <span>{{ formData.role ? formData.role.charAt(0) + formData.role.slice(1).toLowerCase() : 'Select Role' }}</span>
                    <IconChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isRoleDropdownOpen }" />
                  </button>
                  <div
                    v-if="isRoleDropdownOpen"
                    class="absolute left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-[5px] z-50 py-1 max-h-60 overflow-y-auto"
                  >
                    <button
                      v-for="r in store.rolesList"
                      :key="r.name"
                      type="button"
                      @click="formData.role = r.name; isRoleDropdownOpen = false"
                      class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between transition-colors"
                      :class="{ 'text-indigo-600 bg-indigo-50/30': formData.role === r.name }"
                    >
                      {{ r.name.charAt(0) + r.name.slice(1).toLowerCase() }}
                    </button>
                  </div>
                  <p v-if="formErrors.role" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.role }}</p>
                </div>
              </div>

              <!-- If EDIT, show Role & Status row -->
              <div v-else class="grid grid-cols-2 gap-3">
                <div class="relative custom-dropdown-role" v-click-outside="() => isRoleDropdownOpen = false">
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                  <button
                    type="button"
                    @click.stop="isRoleDropdownOpen = !isRoleDropdownOpen"
                    class="mt-1 w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white cursor-pointer select-none text-left flex items-center justify-between min-h-[32px] focus:outline-none focus:border-purple-300 transition-colors"
                    :class="{ 'border-rose-300 focus:border-rose-400': formErrors.role }"
                  >
                    <span>{{ formData.role ? formData.role.charAt(0) + formData.role.slice(1).toLowerCase() : 'Select Role' }}</span>
                    <IconChevronDown class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': isRoleDropdownOpen }" />
                  </button>
                  <div
                    v-if="isRoleDropdownOpen"
                    class="absolute left-0 right-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-[5px] z-50 py-1 max-h-60 overflow-y-auto"
                  >
                    <button
                      v-for="r in store.rolesList"
                      :key="r.name"
                      type="button"
                      @click="formData.role = r.name; isRoleDropdownOpen = false"
                      class="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center justify-between transition-colors"
                      :class="{ 'text-indigo-600 bg-indigo-50/30': formData.role === r.name }"
                    >
                      {{ r.name.charAt(0) + r.name.slice(1).toLowerCase() }}
                    </button>
                  </div>
                  <p v-if="formErrors.role" class="mt-0.5 text-[10px] font-bold text-rose-500">{{ formErrors.role }}</p>
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                  <div class="flex items-center gap-3 mt-1.5">
                    <label class="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700">
                      <input type="radio" v-model="formData.status" value="Active" class="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500" />
                      <span>Active</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer font-bold text-xs text-slate-700">
                      <input type="radio" v-model="formData.status" value="Inactive" class="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500" />
                      <span>Inactive</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-4 py-3 bg-[#f8f9fa] border-t border-slate-50 flex items-center justify-end gap-2 rounded-b-[5px]">
              <button
                @click="closeModal"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                @click="showAddModal ? handleAdd() : handleEdit()"
                :disabled="saving"
                class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm disabled:opacity-50"
              >
                <IconLoader2 v-if="saving" class="h-3 w-3 animate-spin" />
                {{ saving ? 'Saving...' : showAddModal ? 'Add User' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-red-500"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
              </div>
              <h3 class="text-base font-bold text-slate-900">Delete User</h3>
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
                :disabled="saving"
                class="inline-flex items-center justify-center gap-1.5 flex-1 px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm disabled:opacity-50"
              >
                <IconLoader2 v-if="saving" class="h-3 w-3 animate-spin" />
                {{ saving ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
