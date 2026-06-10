<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IconSearch,
  IconPlus,
  IconUser,
  IconUsers,
  IconEdit,
  IconTrash,
} from '@tabler/icons-vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'

const router = useRouter()

// Student Data based on SRS FR-001
const students = ref([
  { id: 'STU-2024-001', name: 'Ahmad Ali', gender: 'Male', batch: '2024', class: 'CS-3A', department: 'Computer Science', status: 'Active', email: 'ahmad.ali@school.edu' },
  { id: 'STU-2024-002', name: 'Siti Aminah', gender: 'Female', batch: '2024', class: 'CS-3B', department: 'Computer Science', status: 'Active', email: 'siti.aminah@school.edu' },
  { id: 'STU-2023-045', name: 'John Doe', gender: 'Male', batch: '2023', class: 'BA-2A', department: 'Business Admin', status: 'Inactive', email: 'john.doe@school.edu' },
  { id: 'STU-2025-012', name: 'Elena Rodriguez', gender: 'Female', batch: '2025', class: 'ENG-1C', department: 'Engineering', status: 'Active', email: 'elena.r@school.edu' },
  { id: 'STU-2022-089', name: 'Kevin Tan', gender: 'Male', batch: '2022', class: 'ART-4A', department: 'Digital Arts', status: 'Graduated', email: 'kevin.tan@school.edu' },
  { id: 'STU-2024-102', name: 'Mariam Ibrahim', gender: 'Female', batch: '2024', class: 'CS-3A', department: 'Computer Science', status: 'Active', email: 'mariam.i@school.edu' },
  { id: 'STU-2023-015', name: 'Liam Wilson', gender: 'Male', batch: '2023', class: 'ENG-2B', department: 'Engineering', status: 'Active', email: 'liam.w@school.edu' },
])

const searchQuery = ref('')
const selectedBatch = ref('')
const selectedDept = ref('')
const selectedStatus = ref('All')

const batches = ['2022', '2023', '2024', '2025']
const departments = ['Computer Science', 'Business Admin', 'Engineering', 'Digital Arts']
const statuses = ['All', 'Active', 'Inactive', 'Graduated']

const batchOptions: DropdownOption[] = [
  { value: '', label: 'All Batches' },
  ...batches.map(b => ({ value: b, label: b })),
]

const deptOptions: DropdownOption[] = [
  { value: '', label: 'All Departments' },
  ...departments.map(d => ({ value: d, label: d })),
]

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesBatch = !selectedBatch.value || s.batch === selectedBatch.value
    const matchesDept = !selectedDept.value || s.department === selectedDept.value
    const matchesStatus = selectedStatus.value === 'All' || s.status === selectedStatus.value
    return matchesSearch && matchesBatch && matchesDept && matchesStatus
  })
})

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    case 'Inactive': return 'bg-slate-100 text-slate-500 border-slate-200'
    case 'Graduated': return 'bg-blue-50 text-blue-600 border-blue-100'
    default: return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

const navigateToProfile = (id: string) => {
  router.push(`/admin/students/${id}`) 
}
</script>

<template>
  <div class="space-y-6 text-left max-w-[1600px] mx-auto pb-8">
    
    <!-- Page Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-base font-bold text-[#0f172a]">Student List</h1>
        <p class="text-xs font-bold text-slate-400 mt-1">Manage institutional student records and monitoring status.</p>
      </div>
      <button class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] rounded-[3px] transition-colors">
        <IconPlus class="w-3.5 h-3.5" />
        Add Student
      </button>
    </div>

    <!-- Filters & Search Bar (SRS Page 3) -->
    <div class="bg-white rounded-[5px] border border-slate-100 p-4 shadow-md space-y-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Search -->
        <div class="relative flex-1 min-w-[300px]">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search by name or Student ID..." 
            class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-2 pl-10 pr-4 text-xs border border-transparent outline-none focus:bg-white focus:border-indigo-200 transition-all"
          >
          <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Filter Selects -->
        <div class="flex items-center gap-2">
          <BaseDropdown v-model="selectedBatch" :options="batchOptions" placeholder="All Batches" />
          <BaseDropdown v-model="selectedDept" :options="deptOptions" placeholder="All Departments" />

          <!-- Status Radio Group (SRS requirement) -->
          <div class="flex items-center bg-slate-50 p-1 rounded-[5px] border border-slate-100 ml-2">
            <button 
              v-for="s in statuses" 
              :key="s"
              @click="selectedStatus = s"
              class="px-3 py-1 text-[10px] font-bold rounded-[4px] transition-all"
              :class="selectedStatus === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Student Table (SRS Page 3) -->
    <div class="bg-white rounded-[5px] border border-slate-100 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID</th>
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</th>
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</th>
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch</th>
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</th>
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr 
              v-for="student in filteredStudents" 
              :key="student.id"
              class="hover:bg-slate-50/30 transition-colors group cursor-pointer"
              @click="navigateToProfile(student.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[3px] uppercase tracking-wider">
                  {{ student.id }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold text-xs">
                    {{ student.name.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <div>
                    <p class="text-xs font-bold text-[#475569] group-hover:text-[#0f172a] transition-colors">{{ student.name }}</p>
                    <p class="text-[10px] font-bold text-slate-400 mt-0.5">{{ student.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#475569]">
                {{ student.department }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#475569] text-center">
                {{ student.batch }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#475569]">
                {{ student.class }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border', getStatusClass(student.status)]">
                  {{ student.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right" @click.stop>
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="navigateToProfile(student.id)"
                    class="p-1.5 rounded-[5px] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                    title="View Profile"
                  >
                    <IconUser class="w-4 h-4" />
                  </button>
                  <button 
                    class="p-1.5 rounded-[5px] text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                    title="Edit Student"
                  >
                    <IconEdit class="w-4 h-4" />
                  </button>
                  <button 
                    class="p-1.5 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    title="Delete Student"
                  >
                    <IconTrash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredStudents.length === 0">
              <td colspan="7" class="py-12 text-center">
                <IconUsers class="mx-auto w-12 h-12 text-slate-200" />
                <p class="text-xs font-bold text-slate-500 mt-3">No students found</p>
                <p class="text-[10px] text-slate-400 mt-1">Try adjusting your filters or search query.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (SRS requirement) -->
      <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <p class="text-[10px] font-bold text-slate-400">
          Showing 1 to {{ filteredStudents.length }} of {{ filteredStudents.length }} students
        </p>
        <div class="flex items-center gap-1">
          <button class="px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-[3px] opacity-50 cursor-not-allowed">Previous</button>
          <button class="px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded-[3px]">1</button>
          <button class="px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded-[3px] hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
