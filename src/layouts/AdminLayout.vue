<script setup lang="ts">
// Layout for admin pages - sidebar on the left, navbar on top, page content in the middle
// Use this for any page that needs the full admin chrome

import Navbar from '@/components/layouts/Navbar.vue'
import Sidebar from '@/components/layouts/Sidebar.vue'
</script>

<template>
  <div class="flex h-screen">
    <Sidebar />
    <div class="flex flex-1 flex-col">
      <Navbar />
      <main class="flex-1 overflow-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
