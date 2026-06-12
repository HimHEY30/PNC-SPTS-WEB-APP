<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  if (auth.isAuthenticated) {
    await auth.fetchProfile()
  }
})
</script>

<template>
  <router-view />
</template>
