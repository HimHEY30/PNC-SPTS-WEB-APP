<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const pageName = {
  students: 'Student Management',
  courses: 'Course Management',
  reports: 'Reports & Analytics',
  settings: 'Settings',
  goals: 'Goal Setting',
  active: 'Active Cases',
  website: 'School Portal',
}[route.path.split('/').pop() || ''] || 'Page'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center">
    <div class="bg-white border border-slate-100 rounded-[48px] p-16 flex flex-col items-center shadow-md max-w-xl text-center">
      <div class="flex h-24 w-24 items-center justify-center rounded-[24px] bg-[#3b4b6b]/10 text-[#3b4b6b] shadow-inner mb-10">
        <span class="text-2xl font-bold">?</span>
      </div>
      <h2 class="text-base font-bold text-[#0f172a]">{{ pageName }}</h2>
      <p class="mt-2 text-xs font-bold text-slate-400 leading-normal">
        This section is coming soon. Stay tuned.
      </p>
    </div>
  </div>
</template>
