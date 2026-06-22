<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api, getErrorMessage } from '@/services/api'
import {
  IconUser,
  IconCheck,
  IconArrowLeft,
  IconEdit,
  IconPhotoUp,
  IconCalendar,
  IconWorld,
  IconBriefcase,
  IconSchool,
  IconPlus,
  IconX,
  IconChevronUp,
  IconMail,
} from '@tabler/icons-vue'
import bannerSrc from '@/assets/images/profile_banner.jpg'

const auth = useAuthStore()
const router = useRouter()

const showEditModal = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const activeTab = ref('Overview')
const tabs = ['Overview', 'Groups', 'Posts', 'Pages', 'Events', 'More']

// Backend-backed form fields
const editForm = reactive({
  first_name: '',
  last_name: '',
  phone: '',
})

// Extra fields stored in localStorage (associated with user's email)
const extra = reactive({
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  pronouns: 'He / Him / His',
  nickname: '',
  languages: 'English, Khmer',
  workHistory: 'Passerelles Numériques Cambodia',
  education: 'PNC Training Center',
  location: 'Phnom Penh, Cambodia',
  tags: [
    { text: 'Academic Tracking', count: 42 },
    { text: 'Student Mentoring', count: 1 },
    { text: 'Curriculum Design', count: 132 },
    { text: 'Web Development', count: 24 },
    { text: 'Community Building', count: 18 },
  ] as Array<{ text: string; count: number }>
})

const currentAvatar = computed(() => {
  if (previewUrl.value) return previewUrl.value
  return auth.user?.profile_image || null
})

const roleTitle = computed(() => {
  const roles = auth.user?.roles || []
  if (roles.includes('SUPER_ADMIN')) return 'Super Admin'
  const entity = auth.user?.entity_type?.replace(/_/g, ' ') || 'Academic'
  return `VP of ${entity} Operations`
})

function loadExtra() {
  const email = auth.user?.email || ''
  if (!email) return
  const cached = localStorage.getItem('profile_extra_' + email)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      Object.assign(extra, parsed)
    } catch {
      // Silently skip
    }
  } else {
    extra.nickname = auth.user?.first_name || ''
  }
}

onMounted(() => {
  loadExtra()
})

function openEditModal() {
  editForm.first_name = auth.user?.first_name || ''
  editForm.last_name = auth.user?.last_name || ''
  editForm.phone = auth.user?.phone || ''
  
  selectedFile.value = null
  previewUrl.value = null
  showEditModal.value = true
  error.value = ''
  success.value = ''
}

function closeEditModal() {
  showEditModal.value = false
  selectedFile.value = null
  previewUrl.value = null
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    previewUrl.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

async function saveEdit() {
  saving.value = true
  error.value = ''
  success.value = ''

  let profileImage: string | undefined
  let uploadFailed = false
  if (selectedFile.value) {
    try {
      const imgFd = new FormData()
      imgFd.append('image', selectedFile.value)
      const imgRes = await api.post('/users/profile/image', imgFd)
      profileImage = imgRes.data?.data?.url || imgRes.data?.url
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('Image upload failed; falling back to local image cache:', msg)
      uploadFailed = true
      if (previewUrl.value) {
        localStorage.setItem('cached_profile_image_' + (auth.user?.email || ''), previewUrl.value)
      }
    }
  }

  const payload: Record<string, unknown> = {
    first_name: editForm.first_name,
    last_name: editForm.last_name,
    phone: editForm.phone || null,
  }
  if (profileImage) {
    payload.profileImage = profileImage
  }

  try {
    try {
      await api.patch('/users/profile', payload)
    } catch (err: unknown) {
      const errObj = err as { response?: { status?: number; data?: { statusCode?: number } } }
      const is404 = errObj?.response?.status === 404 || errObj?.response?.data?.statusCode === 404
      const userId = auth.user?.id || auth.user?.user_id
      if (is404 && userId) {
        await api.patch(`/users/${userId}`, payload)
      } else {
        throw err
      }
    }
    
    await auth.fetchProfile()
    success.value = uploadFailed 
      ? 'Profile text saved (Image saved locally only)' 
      : 'Profile updated successfully'
    showEditModal.value = false
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Failed to update profile')
  } finally {
    selectedFile.value = null
    previewUrl.value = null
    saving.value = false
  }
}

function fmt(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'string' && !isNaN(Date.parse(val))) {
    return new Date(val).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return String(val)
}
</script>

<template>
  <div class="space-y-6 text-left max-w-5xl pb-4">
    <!-- Header Back Navigation & Statuses -->
    <div class="flex items-center justify-between">
      <button
        id="profile-back-btn"
        @click="router.back()"
        class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <IconArrowLeft class="w-4 h-4" />
        Back
      </button>

      <div class="flex gap-2">
        <div v-if="success" class="rounded-[3px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-1.5 flex items-center gap-2">
          <IconCheck class="w-3.5 h-3.5" />
          {{ success }}
        </div>

        <div v-if="error" class="rounded-[3px] bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Hidden input for file selection -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelected"
    />

    <!-- Main 12-Column Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Column (8 cols) -->
      <div class="lg:col-span-8 space-y-6">
        
        <!-- 1. PROFILE HEADER CARD (NO SOCIAL ICONS) -->
        <div class="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm relative text-left">
          
          <!-- Banner Image -->
          <div class="h-16 md:h-20 w-full overflow-hidden bg-slate-50 relative">
            <img :src="bannerSrc" class="w-full h-full object-cover" alt="Banner" />
          </div>

          <!-- Avatar & Info block -->
          <div class="relative flex flex-col sm:flex-row items-start justify-between px-6 pb-6 pt-2">
            
            <div class="flex flex-col sm:flex-row items-start sm:items-end">
              <!-- Avatar overlapping the banner -->
              <div class="relative w-24 h-24 sm:w-28 sm:h-28 -mt-14 sm:-mt-16 rounded-full border-4 border-white bg-slate-50 shadow-md overflow-hidden flex items-center justify-center select-none shrink-0 z-10">
                <img v-if="currentAvatar" :src="currentAvatar" class="w-full h-full object-cover" alt="Avatar" />
                <IconUser v-else class="w-10 h-10 text-slate-400" />
                <!-- Edit button for picture change -->
                <button
                  id="profile-avatar-upload-btn"
                  @click="triggerFileSelect"
                  class="absolute inset-0 bg-black/45 hover:bg-black/55 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200 z-20"
                >
                  <IconPhotoUp class="w-5 h-5" />
                </button>
                <!-- Online Status Dot -->
                <span class="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10"></span>
              </div>

              <!-- Information Block -->
              <div class="mt-4 sm:mt-0 sm:ml-5 pb-1">
                <h2 class="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-none mb-1">
                  {{ auth.user?.name || 'User' }}
                </h2>
                <p class="text-xs text-slate-500 font-semibold capitalize leading-none">
                  {{ roleTitle }}
                </p>
                
                <!-- Location Badge -->
                <div class="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-slate-100/80 text-slate-500 rounded text-[10px] font-semibold leading-none">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {{ extra.location }}
                </div>
              </div>
            </div>

            <!-- Edit Button on Right -->
            <div class="mt-4 sm:mt-0 shrink-0">
              <button
                id="profile-edit-btn"
                @click="openEditModal"
                class="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <IconEdit class="w-3.5 h-3.5 text-slate-500" />
                Edit Profile
              </button>
            </div>

          </div>

        </div>

        <!-- 2. TAB NAVIGATION BAR -->
        <div class="flex gap-2 p-1 bg-slate-100/50 rounded-xl border border-slate-200/50">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-4 py-1.5 text-xs rounded-lg transition-all cursor-pointer',
              activeTab === tab 
                ? 'bg-white text-slate-800 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)]' 
                : 'text-slate-400 hover:text-slate-700 font-medium hover:bg-white/50'
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Tab contents (Render details for active tab Overview) -->
        <template v-if="activeTab === 'Overview'">
          
          <!-- 3. SUMMARY CARD -->
          <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm relative text-left">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-800">Summary</h3>
              <button
                @click="openEditModal"
                class="p-1.5 rounded-[5px] text-slate-400 hover:text-[#059669] hover:bg-emerald-50 transition-all cursor-pointer animate-none"
                title="Edit Summary"
              >
                <IconEdit class="w-4 h-4" />
              </button>
            </div>
            <div class="text-xs text-slate-500 leading-relaxed font-semibold whitespace-pre-line">
              {{ extra.bio }}
            </div>
          </div>

          <!-- 4. ASK ME ABOUT CARD -->
          <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm relative text-left">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-800">Ask Me About</h3>
              <button
                @click="openEditModal"
                class="p-1.5 rounded-[5px] text-slate-400 hover:text-[#059669] hover:bg-emerald-50 transition-all cursor-pointer animate-none"
                title="Edit Tags"
              >
                <IconEdit class="w-4 h-4" />
              </button>
            </div>
            
            <div class="flex flex-wrap gap-2">
              <div 
                v-for="(tag, idx) in extra.tags" 
                :key="tag.text"
                :class="[
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                  idx === 0 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                    : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100'
                ]"
              >
                <span v-if="idx === 0" class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span v-else class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                {{ tag.text }}
                <span class="text-[10px] text-slate-400">• {{ tag.count }}</span>
              </div>
              
              <!-- Add Tag Button -->
              <button 
                @click="openEditModal" 
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 border border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <IconPlus class="w-3.5 h-3.5" />
                Add Tag
              </button>
            </div>
          </div>
          
        </template>
        
        <template v-else>
          <!-- Placeholder tabs -->
          <div class="bg-white rounded-2xl border border-slate-200/60 p-12 shadow-sm text-center">
            <IconUser class="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 class="text-sm font-bold text-slate-700 mb-1">{{ activeTab }} Section</h3>
            <p class="text-xs text-slate-400">Content for the {{ activeTab }} tab will be integrated here.</p>
          </div>
        </template>

        <!-- 5. MY MANAGER (HIERARCHY TREE WITH CHEVRONS) -->
        <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm text-left">
          <h3 class="text-sm font-bold text-slate-800 mb-5">My Manager</h3>
          
          <div class="flex flex-col">
            <!-- CEO -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" class="w-full h-full object-cover" alt="Roy Reznik" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-800">Roy Reznik</h4>
                <p class="text-[10px] text-slate-400 font-bold leading-tight">Chief Executive Officer</p>
              </div>
            </div>

            <!-- Upward Arrow -->
            <div class="flex pl-3.5 my-1.5">
              <IconChevronUp class="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
            </div>

            <!-- COO -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" class="w-full h-full object-cover" alt="James Botosh" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-800">James Botosh</h4>
                <p class="text-[10px] text-slate-400 font-bold leading-tight">Chief Operating officer</p>
              </div>
            </div>

            <!-- Upward Arrow -->
            <div class="flex pl-3.5 my-1.5">
              <IconChevronUp class="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
            </div>

            <!-- Current User (VP) -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                <img v-if="currentAvatar" :src="currentAvatar" class="w-full h-full object-cover" />
                <IconUser v-else class="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-800">{{ auth.user?.name || 'User' }}</h4>
                <p class="text-[10px] text-slate-400 font-bold leading-tight capitalize">
                  VP of {{ auth.user?.entity_type?.replace('_', ' ') || 'Academic' }} Operations
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column (4 cols) -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- 6. ADDITIONAL DETAILS CARD -->
        <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm text-left relative">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-bold text-slate-800">Additional Details</h3>
            <button
              @click="openEditModal"
              class="p-1.5 rounded-[5px] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer animate-none"
              title="Edit Details"
            >
              <IconEdit class="w-4 h-4" />
            </button>
          </div>
          
          <div class="space-y-4">
            
            <!-- Email -->
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mt-0.5 shrink-0">
                <IconMail class="w-4 h-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Email</p>
                <p class="text-xs font-bold text-emerald-600 truncate">{{ auth.user?.email || '—' }}</p>
              </div>
            </div>

            <!-- Languages -->
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mt-0.5 shrink-0">
                <IconWorld class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Languages</p>
                <p class="text-xs font-bold text-emerald-600">{{ extra.languages }}</p>
              </div>
            </div>

            <!-- Nickname -->
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mt-0.5 shrink-0">
                <IconUser class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Nickname</p>
                <p class="text-xs font-bold text-slate-700">{{ extra.nickname || '—' }}</p>
              </div>
            </div>

            <!-- Join Date -->
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mt-0.5 shrink-0">
                <IconCalendar class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Join Date</p>
                <p class="text-xs font-bold text-slate-700">{{ fmt(auth.user?.created_at) }}</p>
              </div>
            </div>

            <!-- Work History -->
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mt-0.5 shrink-0">
                <IconBriefcase class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Work History</p>
                <p class="text-xs font-bold text-emerald-600">{{ extra.workHistory }}</p>
              </div>
            </div>

            <!-- Education -->
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mt-0.5 shrink-0">
                <IconSchool class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Education</p>
                <p class="text-xs font-bold text-emerald-600">{{ extra.education }}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  </div>

  <!-- EDIT PROFILE MODAL -->
  <div
    v-if="showEditModal"
    class="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto"
  >
    <div
      @click.stop
      class="bg-white rounded-lg w-full max-w-lg shadow-xl flex flex-col max-h-[90vh] text-left animate-none"
    >
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-800">Edit Profile Details</h3>
        <button
          @click="closeEditModal"
          class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg"
        >
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-4 overflow-y-auto flex-1 text-xs">

        <!-- Profile Image -->
        <div class="flex items-center gap-4 border border-dashed border-slate-200 rounded-[5px] p-3 bg-slate-50/50">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
            <img v-if="currentAvatar" :src="currentAvatar" class="w-full h-full object-cover" alt="Avatar" />
            <IconUser v-else class="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profile Photo</label>
            <div class="flex items-center gap-2">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileSelected"
              />
              <button
                @click="triggerFileSelect"
                class="px-3 py-1 bg-white border border-slate-200 rounded-[3px] text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                Choose Photo
              </button>
            </div>
          </div>
        </div>

        <!-- First and Last Name Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name</label>
            <input
              v-model="editForm.first_name"
              type="text"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              placeholder="First name..."
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name</label>
            <input
              v-model="editForm.last_name"
              type="text"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              placeholder="Last name..."
            />
          </div>
        </div>

        <!-- Email & Phone Grid -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email</label>
            <input
              :value="auth.user?.email"
              type="email"
              disabled
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-400 bg-slate-50 cursor-not-allowed"
              placeholder="email..."
            />
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
            <input
              v-model="editForm.phone"
              type="text"
              class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              placeholder="Phone number..."
            />
          </div>
        </div>
        </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 p-5 border-t border-slate-100 bg-slate-50/30">
        <button
          @click="closeEditModal"
          class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-4 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          @click="saveEdit"
          :disabled="saving"
          class="rounded-[3px] bg-slate-900 text-white px-4 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>
