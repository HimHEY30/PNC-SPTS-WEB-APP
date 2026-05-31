<script setup lang="ts">
// Default layout - navbar at the top, page content below, nothing fancy
// Use this for pages that don't need a sidebar

import Navbar from '@/components/layouts/Navbar.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <Navbar />
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
