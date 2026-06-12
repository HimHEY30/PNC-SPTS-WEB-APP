<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'
import {
  IconUser,
  IconCheck,
  IconArrowLeft,
  IconEdit,
  IconDeviceFloppy,
  IconCircleOff,
  IconPhotoUp,
  IconBrandTwitter,
  IconBrandFacebook,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconDots,
  IconActivity,
  IconListCheck,
  IconDatabase,
  IconCalendar,
  IconGitFork,
  IconMessageCircle,
  IconFileText,
} from '@tabler/icons-vue'

const auth = useAuthStore()
const router = useRouter()

const editing = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const form = reactive({
  first_name: '',
  last_name: '',
  phone: '',
})

const currentAvatar = computed(() => {
  if (previewUrl.value) return previewUrl.value
  return auth.user?.profile_image || null
})

function startEdit() {
  form.first_name = auth.user?.first_name || ''
  form.last_name = auth.user?.last_name || ''
  form.phone = auth.user?.phone || ''
  selectedFile.value = null
  previewUrl.value = null
  editing.value = true
  error.value = ''
  success.value = ''
}

function cancelEdit() {
  editing.value = false
  selectedFile.value = null
  previewUrl.value = null
  error.value = ''
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
  
  const localUpdate: Record<string, unknown> = {
    first_name: form.first_name,
    last_name: form.last_name,
    phone: form.phone || null,
  }
  if (previewUrl.value) {
    localUpdate.profile_image = previewUrl.value
  }
  
  try {
    let profileImage = undefined
    if (selectedFile.value) {
      const imgFd = new FormData()
      imgFd.append('image', selectedFile.value)
      const imgRes = await api.post('/api/users/profile/image', imgFd)
      if (imgRes.data?.data?.url) {
        profileImage = imgRes.data.data.url
      }
    }
    const payload: Record<string, unknown> = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
    }
    if (profileImage) {
      payload.profileImage = profileImage
      localUpdate.profile_image = profileImage
    }
    const res = await api.patch('/api/users/profile', payload)
    if (res.data?.success) {
      await auth.fetchProfile()
      editing.value = false
      selectedFile.value = null
      previewUrl.value = null
      success.value = 'Profile updated successfully'
    } else {
      auth.updateUserLocal(localUpdate)
      editing.value = false
      selectedFile.value = null
      previewUrl.value = null
      success.value = 'Profile updated locally'
    }
  } catch (err) {
    console.warn('API update failed, saving profile locally in cache:', err)
    auth.updateUserLocal(localUpdate)
    editing.value = false
    selectedFile.value = null
    previewUrl.value = null
    success.value = 'Profile updated locally (offline mode)'
  } finally {
    saving.value = false
  }
}

function fmt(val: unknown): string {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'string' && !isNaN(Date.parse(val))) {
    return new Date(val).toLocaleString()
  }
  return String(val)
}
</script>

<template>
  <div class="space-y-6 text-left max-w-[1600px] mx-auto pb-8">
    <!-- Header Back Navigation & Statuses -->
    <div class="flex items-center justify-between">
      <button
        id="profile-back-btn"
        @click="router.back()"
        class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
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

    <!-- Layout Grid matching Screenshot -->
    <div class="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">
      
      <!-- LEFT SIDEBAR PROFILE SUMMARY -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <!-- Brand Color Header Banner -->
        <div class="h-28 bg-[#3b4b6b] relative"></div>

        <!-- Overlapping Avatar -->
        <div class="relative flex justify-center -mt-12">
          <div class="relative group">
            <div
              v-if="currentAvatar"
              class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white"
            >
              <img :src="currentAvatar" class="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div
              v-else
              class="w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md flex items-center justify-center"
            >
              <IconUser class="w-10 h-10 text-slate-400" />
            </div>
            <button
              id="profile-avatar-upload-btn"
              v-if="editing"
              @click="triggerFileSelect"
              class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/65 transition-colors"
            >
              <IconPhotoUp class="w-6 h-6 text-white" />
            </button>
            <!-- Green active dot -->
            <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
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

        <!-- Name and Role -->
        <div class="text-center mt-4 px-4">
          <h1 class="text-lg font-bold text-slate-800 truncate">
            {{ auth.user?.first_name || '' }} {{ auth.user?.last_name || 'User' }}
          </h1>
          <p class="text-xs text-slate-400 capitalize mt-0.5 truncate">
            {{ auth.user?.entity_type?.replace('_', ' ') || '' }}
          </p>
        </div>

        <!-- Social Icons -->
        <div class="flex items-center justify-center gap-2 mt-4 px-4">
          <a href="#" id="social-twitter-link" class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#3b4b6b] hover:border-slate-300 transition-colors">
            <IconBrandTwitter class="w-4 h-4" />
          </a>
          <a href="#" id="social-facebook-link" class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#3b4b6b] hover:border-slate-300 transition-colors">
            <IconBrandFacebook class="w-4 h-4" />
          </a>
          <a href="#" id="social-linkedin-link" class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#3b4b6b] hover:border-slate-300 transition-colors">
            <IconBrandLinkedin class="w-4 h-4" />
          </a>
          <a href="#" id="social-pinterest-link" class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-slate-300 transition-colors">
            <IconBrandPinterest class="w-4 h-4" />
          </a>
          <button id="social-more-btn" class="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors">
            <IconDots class="w-4 h-4" />
          </button>
        </div>

        <div class="border-t border-slate-100 my-4"></div>

        <!-- Sidebar Navigation Menu -->
        <div class="px-2 space-y-1">
          <button id="nav-activity-btn" class="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors text-left">
            <IconActivity class="w-4 h-4" />
            Activity
          </button>
          <button id="nav-tasks-btn" class="w-full flex items-center justify-between px-4 py-2 text-xs font-medium text-[#3b4b6b] bg-slate-50 border-l-2 border-[#3b4b6b] rounded-r transition-colors text-left">
            <span class="flex items-center gap-3">
              <IconListCheck class="w-4 h-4" />
              Assigned Tasks
            </span>
          </button>
          <button id="nav-storage-btn" class="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors text-left">
            <IconDatabase class="w-4 h-4" />
            Storage
          </button>
        </div>

        <div class="border-t border-slate-100 my-4"></div>

        <!-- Bio text -->
        <div class="px-5 text-xs text-slate-500 leading-relaxed text-center">
          Conversations can be a tricky business. Sometimes, decoding what is said with what is meant is difficult at best.
        </div>

        <!-- Tags/Skills -->
        <div class="flex flex-wrap gap-1 px-5 mt-4 justify-center">
          <span class="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-medium">Business</span>
          <span class="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-medium">Management</span>
          <span class="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-medium">UI/UX</span>
          <span class="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-medium">Development</span>
          <span class="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-[10px] font-medium">Marketing</span>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 p-5 mt-6 border-t border-slate-50 bg-slate-50/50">
          <button id="profile-send-msg-btn" class="rounded-[3px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 transition-colors shadow-sm">
            Send Message
          </button>
          <button id="profile-subscribe-btn" class="rounded-[3px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 transition-colors border border-slate-200">
            Subscribe
          </button>
        </div>
      </div>

      <!-- RIGHT MAIN CONTENT PANEL -->
      <div class="space-y-6">

        <!-- 1. PROFILE DETAILS CARD -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-800">Profile Information</h2>
            
            <button
              id="profile-edit-btn"
              v-if="!editing"
              @click="startEdit"
              class="rounded-[3px] bg-slate-900 text-white text-xs px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
            >
              <IconEdit class="w-3.5 h-3.5" />
              Edit Profile
            </button>
            <div v-else class="flex items-center gap-1.5">
              <button
                id="profile-save-btn"
                @click="saveEdit"
                :disabled="saving"
                class="rounded-[3px] bg-[#3b4b6b] hover:bg-[#2e3b54] text-white text-xs px-3 py-1.5 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <IconDeviceFloppy v-if="!saving" class="w-3.5 h-3.5" />
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
              <button
                id="profile-cancel-btn"
                @click="cancelEdit"
                class="rounded-[3px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs px-3 py-1.5 flex items-center gap-1.5 transition-colors"
              >
                <IconCircleOff class="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>

          <!-- Edit Form Fields -->
          <div v-if="editing" class="p-6 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="profile-firstname-input" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Name</label>
                <input
                  id="profile-firstname-input"
                  v-model="form.first_name"
                  type="text"
                  class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 bg-white"
                  placeholder="Enter first name..."
                />
              </div>
              <div>
                <label for="profile-lastname-input" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Name</label>
                <input
                  id="profile-lastname-input"
                  v-model="form.last_name"
                  type="text"
                  class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 bg-white"
                  placeholder="Enter last name..."
                />
              </div>
            </div>
            <div>
              <label for="profile-phone-input" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
              <input
                id="profile-phone-input"
                v-model="form.phone"
                type="text"
                class="w-full rounded-[3px] border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400 bg-white"
                placeholder="Enter phone number..."
              />
            </div>
          </div>

          <!-- Read-only Details View -->
          <div v-else class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">First Name</span>
              <span class="text-sm text-slate-700 font-medium">{{ auth.user?.first_name || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Last Name</span>
              <span class="text-sm text-slate-700 font-medium">{{ auth.user?.last_name || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address</span>
              <span class="text-sm text-slate-700 font-medium">{{ auth.user?.email || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone Number</span>
              <span class="text-sm text-slate-700 font-medium">{{ auth.user?.phone || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Entity Type</span>
              <span class="text-sm text-slate-700 font-medium capitalize">{{ auth.user?.entity_type?.replace('_', ' ') || '—' }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Account Status</span>
              <div class="mt-0.5 flex items-center gap-1.5">
                <span class="rounded-[3px] px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-700" v-if="auth.user?.is_active">
                  Active
                </span>
                <span class="rounded-[3px] px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700" v-else>
                  Inactive
                </span>
                <span class="rounded-[3px] bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium uppercase">
                  {{ auth.user?.status }}
                </span>
              </div>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">System Roles</span>
              <div class="mt-0.5 flex flex-wrap gap-1">
                <span v-for="role in (auth.user?.roles || [])" :key="role" class="rounded-[3px] bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium">
                  {{ role }}
                </span>
              </div>
            </div>
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Last Login Session</span>
              <span class="text-sm text-slate-700 font-medium">{{ fmt(auth.user?.last_login_at) }}</span>
            </div>
            <div class="sm:col-span-2 border-t border-slate-100 pt-4 flex gap-6 text-[10px] text-slate-400">
              <span>Account Created: {{ fmt(auth.user?.created_at) }}</span>
              <span>Last Updated: {{ fmt(auth.user?.updated_at) }}</span>
            </div>
          </div>
        </div>

        <!-- 2. RECENT ACTIVITY CARD -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-800">Recent activity</h2>
            <a href="#" id="view-all-updates-link" class="text-xs font-semibold text-[#3b4b6b] hover:text-[#2e3b54] hover:underline">See all updates &gt;</a>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-start gap-3 text-xs text-slate-600">
              <IconCalendar class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span class="font-bold text-slate-800">28 February</span>
                <span class="mx-1 font-medium text-slate-700">Meeting with client</span>
                <span class="text-slate-400">about</span>
                <a href="#" class="ml-1 text-indigo-600 hover:text-indigo-800 hover:underline font-semibold">Spotify redesign</a>
              </div>
            </div>
            <div class="flex items-start gap-3 text-xs text-slate-600">
              <IconCalendar class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span class="font-bold text-slate-800">1 March</span>
                <span class="mx-1 font-medium text-slate-700">New incoming request</span>
                <span class="text-slate-400">send price for</span>
                <a href="#" class="ml-1 text-indigo-600 hover:text-indigo-800 hover:underline font-semibold">Fintess mobile app design</a>
              </div>
            </div>
            <div class="flex items-start gap-3 text-xs text-slate-600">
              <IconCalendar class="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span class="font-bold text-slate-800">2 March</span>
                <span class="mx-1 font-medium text-slate-700">Meeting with client</span>
                <span class="text-slate-400">about</span>
                <a href="#" class="ml-1 text-indigo-600 hover:text-indigo-800 hover:underline font-semibold">Dropbox branding conpect</a>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. RECENT TASKS CARD -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-800">Recent tasks</h2>
            <a href="#" id="view-all-tasks-link" class="text-xs font-semibold text-[#3b4b6b] hover:text-[#2e3b54] hover:underline">See all tasks &gt;</a>
          </div>
          <div class="divide-y divide-slate-100">
            <!-- Row 1 -->
            <div class="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span class="text-xs font-semibold text-slate-700">Prepare HTML & CSS</span>
              </div>
              <div class="flex items-center gap-4 text-slate-400 text-xs">
                <span class="flex items-center gap-1"><IconGitFork class="w-3.5 h-3.5" /> 5/19</span>
                <span class="flex items-center gap-1"><IconMessageCircle class="w-3.5 h-3.5" /> 7</span>
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-300 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-400 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                </div>
              </div>
            </div>
            <!-- Row 2 -->
            <div class="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span class="text-xs font-semibold text-slate-700">Design search page</span>
              </div>
              <div class="flex items-center gap-4 text-slate-400 text-xs">
                <span class="flex items-center gap-1"><IconGitFork class="w-3.5 h-3.5" /> 4/8</span>
                <span class="flex items-center gap-1"><IconMessageCircle class="w-3.5 h-3.5" /> 2</span>
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-300 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                </div>
              </div>
            </div>
            <!-- Row 3 -->
            <div class="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span class="text-xs font-semibold text-slate-700">Prepare HTML & CSS</span>
              </div>
              <div class="flex items-center gap-4 text-slate-400 text-xs">
                <span class="flex items-center gap-1"><IconGitFork class="w-3.5 h-3.5" /> 19/49</span>
                <span class="flex items-center gap-1"><IconMessageCircle class="w-3.5 h-3.5" /> 23</span>
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-300 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-400 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-500 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                </div>
              </div>
            </div>
            <!-- Row 4 -->
            <div class="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span class="text-xs font-semibold text-slate-700">Budget and contract</span>
              </div>
              <div class="flex items-center gap-4 text-slate-400 text-xs">
                <span class="flex items-center gap-1"><IconGitFork class="w-3.5 h-3.5" /> 9/18</span>
                <span class="flex items-center gap-1"><IconMessageCircle class="w-3.5 h-3.5" /> 6</span>
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-300 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                </div>
              </div>
            </div>
            <!-- Row 5 -->
            <div class="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                <span class="text-xs font-semibold text-slate-700">Fix issues</span>
              </div>
              <div class="flex items-center gap-4 text-slate-400 text-xs">
                <span class="flex items-center gap-1"><IconGitFork class="w-3.5 h-3.5" /> 15/30</span>
                <span class="flex items-center gap-1"><IconMessageCircle class="w-3.5 h-3.5" /> 19</span>
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-300 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-400 overflow-hidden"><IconUser class="w-full h-full p-0.5 text-slate-500" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. UPLOADED FILES CARD -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-left">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-800">Uploaded files</h2>
            <a href="#" id="view-all-files-link" class="text-xs font-semibold text-[#3b4b6b] hover:text-[#2e3b54] hover:underline">See all files &gt;</a>
          </div>
          <div class="p-6 space-y-4">
            <!-- File 1 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                  <IconFileText class="w-5 h-5" />
                </div>
                <div>
                  <span class="text-xs font-semibold text-slate-700 block">IOtask web UI kit.sketch</span>
                  <span class="rounded-[3px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 text-[9px] font-bold">Design</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-200 text-[8px] font-bold flex items-center justify-center text-slate-500">+5</div>
                </div>
                <button class="text-slate-400 hover:text-slate-600"><IconDots class="w-4 h-4" /></button>
              </div>
            </div>
            <!-- File 2 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <IconFileText class="w-5 h-5" />
                </div>
                <div>
                  <span class="text-xs font-semibold text-slate-700 block">User stories.docx</span>
                  <span class="rounded-[3px] bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[9px] font-bold">Documents</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-200 text-[8px] font-bold flex items-center justify-center text-slate-500">+3</div>
                </div>
                <button class="text-slate-400 hover:text-slate-600"><IconDots class="w-4 h-4" /></button>
              </div>
            </div>
            <!-- File 3 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <IconFileText class="w-5 h-5" />
                </div>
                <div>
                  <span class="text-xs font-semibold text-slate-700 block">Budget estimates for UI design.xlsx</span>
                  <span class="rounded-[3px] bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[9px] font-bold">Documents</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-200 text-[8px] font-bold flex items-center justify-center text-slate-500">+6</div>
                </div>
                <button class="text-slate-400 hover:text-slate-600"><IconDots class="w-4 h-4" /></button>
              </div>
            </div>
            <!-- File 4 -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
                  <IconFileText class="w-5 h-5" />
                </div>
                <div>
                  <span class="text-xs font-semibold text-slate-700 block">Presentation for investors.pptx</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex -space-x-1.5 overflow-hidden">
                  <div class="w-5 h-5 rounded-full border border-white bg-slate-200 text-[8px] font-bold flex items-center justify-center text-slate-500">+8</div>
                </div>
                <button class="text-slate-400 hover:text-slate-600"><IconDots class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
