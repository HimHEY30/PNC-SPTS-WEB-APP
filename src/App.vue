<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const toast = useToastStore()

onMounted(async () => {
  if (auth.isAuthenticated) {
    await auth.fetchProfile()
  }
})
</script>

<template>
  <router-view />

  <!-- Global Toast Notification -->
  <Transition
    enter-active-class="transform ease-out duration-300 transition"
    enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
    leave-active-class="transition ease-in duration-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="toast.show" class="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-white rounded-lg shadow-lg border border-slate-100 pointer-events-auto flex overflow-hidden">
      <div class="p-4 flex items-start gap-3 w-full">
        <div v-if="toast.type === 'success'" class="flex-shrink-0 text-emerald-500 bg-emerald-50 p-1.5 rounded-full">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div v-else class="flex-shrink-0 text-red-500 bg-red-50 p-1.5 rounded-full">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div class="flex-1 min-w-0 text-left">
          <p class="text-sm font-semibold text-slate-900">
            {{ toast.type === 'success' ? 'Success' : 'Error' }}
          </p>
          <p class="text-xs text-slate-500 mt-0.5">
            {{ toast.message }}
          </p>
        </div>
        <button @click="toast.hideToast()" class="flex-shrink-0 text-slate-400 hover:text-slate-500 transition-colors p-0.5 rounded-lg hover:bg-slate-50">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>
