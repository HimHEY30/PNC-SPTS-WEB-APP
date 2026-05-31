<script setup lang="ts">
// Top navigation bar - shows a logout button if the user is logged in
// Has named slots so you can stick extra stuff on the left or right side

import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

// Log the user out and send them back to the login page
const handleLogout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <nav class="flex h-14 items-center justify-between border-b bg-white px-6">
    <div class="flex items-center gap-4">
      <slot name="left" />
    </div>
    <div class="flex items-center gap-3">
      <slot name="right" />
      <button
        v-if="auth.isAuthenticated"
        @click="handleLogout"
        class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
