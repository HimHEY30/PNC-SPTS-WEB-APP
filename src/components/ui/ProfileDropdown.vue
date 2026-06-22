<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { IconExternalLink } from '@tabler/icons-vue'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  logout: []
}>()

const router = useRouter()
const auth = useAuthStore()

function userInitials() {
  const name = auth.user?.name || ''
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}
</script>

<template>
  <Teleport to="body">
    <template v-if="visible">
      <div class="fixed inset-0 z-40" @click="$emit('close')"></div>
      <div
        class="fixed z-50 w-72 bg-white border border-slate-200 rounded-[8px] shadow-2xl p-2 text-slate-700"
        style="top: 56px; right: 20px"
        @click.stop
      >
        <div class="px-2 py-1">
          <p class="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider px-1">Account</p>
          <div class="flex items-center gap-2 mb-1.5 px-1">
            <div
              class="w-8 h-8 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-sm text-white shrink-0 overflow-hidden"
            >
              <img
                v-if="auth.user?.profile_image"
                :src="auth.user.profile_image"
                class="w-full h-full object-cover"
                alt="User avatar"
              />
              <span v-else>{{ userInitials() }}</span>
            </div>
            <div class="overflow-hidden">
              <p class="text-xs font-bold text-slate-800 truncate">{{ auth.user?.name || 'User' }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ auth.user?.email || '' }}</p>
            </div>
          </div>
          <button @click="router.push('/admin/profile'); emit('close')" class="light-drop-item w-full text-xs">
            Manage Profile <IconExternalLink class="w-3 h-3 opacity-50" />
          </button>
        </div>

        <div class="border-t border-slate-100 mx-2 my-0.5"></div>

        <div class="px-2 py-1">
          <p class="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider px-1">Settings</p>
          <button @click="router.push('/admin/profile'); emit('close')" class="light-drop-item w-full text-xs">Profile</button>
          <button class="light-drop-item w-full text-xs">Help</button>
          <button class="light-drop-item w-full text-xs">Shortcuts</button>
        </div>

        <div class="border-t border-slate-100 mx-2 my-0.5"></div>

        <div class="px-2 py-1">
          <button @click="$emit('logout')" class="light-drop-item w-full text-xs">Log out</button>
        </div>
      </div>
    </template>
  </Teleport>
</template>
