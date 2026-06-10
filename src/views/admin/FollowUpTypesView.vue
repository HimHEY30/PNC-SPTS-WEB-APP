<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconCircleDot,
  IconX,
  IconCheck,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

interface FollowUpType {
  id: number
  name: string
  description: string
  status: 'Active' | 'Inactive'
  createdBy: string
}

const followUpTypes = ref<FollowUpType[]>([
  { id: 1, name: 'Academic', description: 'Concerns regarding grades, exams, or homework assignments', status: 'Active', createdBy: 'Sarah Johnson' },
  { id: 2, name: 'Behaviour', description: 'Disruptive conduct, class attendance, lateness, or classroom violations', status: 'Active', createdBy: 'Sarah Johnson' },
  { id: 3, name: 'Pastoral Care', description: 'Student welfare, counseling, mental health, and physical wellbeing support', status: 'Active', createdBy: 'Omotola Hazyz' },
  { id: 4, name: 'Achievement', description: 'Outstanding performance, Olympiad recognition, or extra-curricular projects', status: 'Active', createdBy: 'Ms. Chantrea Keo' },
  { id: 5, name: 'Attendance', description: 'Persistent unexcused absences and consecutive missing sessions', status: 'Inactive', createdBy: 'Sarah Johnson' },
])

const searchQuery = ref('')
const selectedStatus = ref('')

const statusOptions: DropdownOption[] = [
  { value: '', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
]

const filteredTypes = computed(() => {
  let result = followUpTypes.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }

  if (selectedStatus.value) {
    result = result.filter(t => t.status === selectedStatus.value)
  }

  return result
})

// Modal Controls for Add/Edit
const showModal = ref(false)
const modalMode = ref<'add' | 'edit'>('add')
const editingTypeId = ref<number | null>(null)

const formName = ref('')
const formDescription = ref('')
const formErrors = ref<Record<string, string>>({})

const openAddModal = () => {
  modalMode.value = 'add'
  editingTypeId.value = null
  formName.value = ''
  formDescription.value = ''
  formErrors.value = {}
  showModal.value = true
}

const openEditModal = (type: FollowUpType) => {
  modalMode.value = 'edit'
  editingTypeId.value = type.id
  formName.value = type.name
  formDescription.value = type.description
  formErrors.value = {}
  showModal.value = true
}

const toggleStatus = (type: FollowUpType) => {
  type.status = type.status === 'Active' ? 'Inactive' : 'Active'
}

const handleSave = () => {
  const errors: Record<string, string> = {}
  if (!formName.value.trim()) errors.name = 'Type Name is required'

  if (Object.keys(errors).length > 0) {
    formErrors.value = errors
    return
  }

  if (modalMode.value === 'add') {
    followUpTypes.value.push({
      id: Date.now(),
      name: formName.value.trim(),
      description: formDescription.value.trim(),
      status: 'Active',
      createdBy: 'Omotola Hazyz', // Authenticated Admin User
    })
  } else if (modalMode.value === 'edit' && editingTypeId.value !== null) {
    const type = followUpTypes.value.find(t => t.id === editingTypeId.value)
    if (type) {
      type.name = formName.value.trim()
      type.description = formDescription.value.trim()
    }
  }

  showModal.value = false
}
</script>

<template>
  <div class="space-y-6 text-left max-w-[1400px] mx-auto pb-10">
    
    <!-- Header Page Section -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <h1 class="text-base font-bold text-[#0f172a]">Follow-Up Types</h1>
        <p class="text-xs font-bold text-slate-400">
          Configure and manage student follow-up categories and status visibility options.
        </p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 rounded-[5px] bg-[#3b4b6b] px-4 py-2 text-xs font-bold text-white hover:bg-[#2e3b54] transition-colors shadow-sm"
      >
        <IconPlus class="h-4 w-4" />
        Add Type
      </button>
    </div>

    <!-- Filter and Search Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Search input -->
      <div class="relative flex-1 min-w-[280px] max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or description..."
          class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
        />
        <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <BaseDropdown v-model="selectedStatus" :options="statusOptions" :icon="IconCircleDot" placeholder="All Status" />
    </div>

    <!-- Table Grid container -->
    <div class="bg-white rounded-[5px] border border-slate-100 shadow-md overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-50 bg-slate-50/50">
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type Name</th>
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created By</th>
            <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr 
            v-for="type in filteredTypes" 
            :key="type.id" 
            class="group hover:bg-slate-50/30 transition-colors"
            :class="{ 'opacity-60 bg-slate-50/40': type.status === 'Inactive' }"
          >
            <!-- Type name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-xs font-bold text-[#475569]">{{ type.name }}</span>
            </td>

            <!-- Description -->
            <td class="px-6 py-4 max-w-md">
              <p class="text-xs font-bold text-slate-500 leading-normal line-clamp-2">{{ type.description }}</p>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border"
                :class="
                  type.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                "
              >
                {{ type.status }}
              </span>
            </td>

            <!-- Creator -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-xs font-bold text-slate-400">{{ type.createdBy }}</span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
              <div class="flex items-center justify-end gap-3">
                <button 
                  @click="openEditModal(type)"
                  class="text-indigo-600 hover:text-indigo-900 transition-colors"
                  title="Edit Type"
                >
                  <IconEdit class="h-4.5 w-4.5" />
                </button>
                <button 
                  @click="toggleStatus(type)"
                  class="transition-colors"
                  :class="type.status === 'Active' ? 'text-rose-500 hover:text-rose-800' : 'text-emerald-500 hover:text-emerald-800'"
                  :title="type.status === 'Active' ? 'Deactivate Type' : 'Activate Type'"
                >
                  <IconX v-if="type.status === 'Active'" class="h-4.5 w-4.5" />
                  <IconCheck v-else class="h-4.5 w-4.5" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty search results -->
          <tr v-if="filteredTypes.length === 0">
            <td colspan="5" class="py-12 text-center">
              <IconCircleDot class="mx-auto h-8 w-8 text-slate-300" />
              <p class="text-sm font-bold text-slate-500 mt-2">No follow-up categories found</p>
              <p class="text-xs text-slate-400">Try adjusting your search query or dropdown filter</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form (Add / Edit) -->
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
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          @click="showModal = false"
        >
          <div 
            class="bg-white rounded-[5px] shadow-2xl p-6 max-w-md w-full relative space-y-4"
            @click.stop
          >
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-slate-50 pb-2">
              <h3 class="text-base font-bold text-slate-900">
                {{ modalMode === 'add' ? 'Add New Category' : 'Edit Category Details' }}
              </h3>
              <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
                <IconX class="w-4 h-4" />
              </button>
            </div>

            <!-- Content Form -->
            <div class="space-y-3">
              <div>
                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Type Name</label>
                <input 
                  v-model="formName"
                  type="text" 
                  placeholder="e.g. Pastoral Care"
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors"
                  :class="{ 'border-rose-300 focus:border-rose-400': formErrors.name }"
                />
                <span v-if="formErrors.name" class="text-[10px] text-rose-500 font-bold mt-1 block">{{ formErrors.name }}</span>
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1">Description</label>
                <textarea 
                  v-model="formDescription"
                  rows="3"
                  placeholder="Provide a clear explanation for this category..."
                  class="w-full border border-slate-200 rounded-[5px] px-3 py-1.5 text-xs text-[#0f172a] focus:border-purple-300 focus:outline-none transition-colors resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Footer Buttons -->
            <div class="flex justify-end gap-2 border-t border-slate-50 pt-3">
              <button 
                @click="showModal = false"
                class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-[5px] text-xs font-bold text-slate-500 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                @click="handleSave"
                class="px-4 py-1.5 bg-[#1e1b4b] hover:bg-[#2e3b54] text-white font-bold text-xs rounded-[5px] transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Scoped css helper if needed */
</style>
