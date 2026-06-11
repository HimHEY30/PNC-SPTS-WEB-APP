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
    }
    const res = await api.patch('/api/users/profile', payload)
    if (res.data?.success) {
      await auth.fetchProfile()
      editing.value = false
      selectedFile.value = null
      previewUrl.value = null
      success.value = 'Profile updated successfully'
    }
  } catch (err) {
    const e = err as { response?: { data?: { message?: string } } }
    error.value = e.response?.data?.message || 'Failed to update profile'
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
  <div class="max-w-3xl mx-auto space-y-4">
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
    >
      <IconArrowLeft class="w-4 h-4" />
      Back
    </button>

    <div v-if="success" class="rounded-[3px] bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 flex items-center gap-2">
      <IconCheck class="w-3.5 h-3.5" />
      {{ success }}
    </div>

    <div v-if="error" class="rounded-[3px] bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
      {{ error }}
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-slate-900 px-6 py-6 flex items-center gap-4">
        <div class="relative shrink-0 group">
          <div
            v-if="currentAvatar"
            class="w-14 h-14 rounded-full overflow-hidden"
          >
            <img :src="currentAvatar" class="w-full h-full object-cover" alt="Avatar" />
          </div>
          <div
            v-else
            class="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center"
          >
            <IconUser class="w-7 h-7 text-slate-400" />
          </div>
          <button
            v-if="editing"
            @click="triggerFileSelect"
            class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <IconPhotoUp class="w-5 h-5 text-white" />
          </button>
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-base font-bold text-white truncate">{{ auth.user?.name || 'User' }}</h1>
          <p class="text-xs text-slate-400 capitalize truncate">{{ auth.user?.entity_type?.replace('_', ' ') || '' }}</p>
        </div>
        <button
          v-if="!editing"
          @click="startEdit"
          class="rounded-[3px] bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 flex items-center gap-1.5 transition-colors"
        >
          <IconEdit class="w-3.5 h-3.5" />
          Edit
        </button>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Editable fields -->
      <div v-if="editing" class="p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</label>
            <input
              v-model="form.first_name"
              class="mt-1 w-full rounded-[3px] border border-slate-300 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500 transition-colors"
            />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</label>
            <input
              v-model="form.last_name"
              class="mt-1 w-full rounded-[3px] border border-slate-300 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500 transition-colors"
            />
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
          <input
            v-model="form.phone"
            class="mt-1 w-full rounded-[3px] border border-slate-300 px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-500 transition-colors"
          />
        </div>
        <div class="flex items-center gap-2 pt-2">
          <button
            @click="saveEdit"
            :disabled="saving"
            class="rounded-[3px] bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-1.5 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <IconDeviceFloppy v-if="!saving" class="w-3.5 h-3.5" />
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <button
            @click="cancelEdit"
            class="rounded-[3px] border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs px-4 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <IconCircleOff class="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>
      </div>

      <!-- Read-only view -->
      <div v-else class="divide-y divide-slate-100">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">First Name</p>
            <p class="mt-0.5 text-sm text-slate-800">{{ auth.user?.first_name || '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Name</p>
            <p class="mt-0.5 text-sm text-slate-800">{{ auth.user?.last_name || '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
            <p class="mt-0.5 text-sm text-slate-800">{{ auth.user?.email || '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
            <p class="mt-0.5 text-sm text-slate-800">{{ auth.user?.phone || '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Entity Type</p>
            <p class="mt-0.5 text-sm text-slate-800 capitalize">{{ auth.user?.entity_type?.replace('_', ' ') || '—' }}</p>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</p>
            <div class="mt-0.5 flex items-center gap-2">
              <span
                :class="auth.user?.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                class="rounded-[3px] px-2 py-0.5 text-xs font-medium"
              >
                {{ auth.user?.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="rounded-[3px] bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium">
                {{ auth.user?.status }}
              </span>
            </div>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Roles</p>
            <div class="mt-0.5 flex flex-wrap gap-1.5">
              <span
                v-for="role in (auth.user?.roles || [])"
                :key="role"
                class="rounded-[3px] bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium"
              >
                {{ role }}
              </span>
            </div>
          </div>
          <div class="px-5 py-3">
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Login</p>
            <p class="mt-0.5 text-sm text-slate-800">{{ fmt(auth.user?.last_login_at) }}</p>
          </div>
        </div>

        <div class="px-5 py-3 flex items-center gap-6 text-xs text-slate-400">
          <span>Created: {{ fmt(auth.user?.created_at) }}</span>
          <span>Updated: {{ fmt(auth.user?.updated_at) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
