<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AdminSidebar from '@/components/layouts/AdminSidebar.vue'
import tolaAvatar from '@/assets/images/tola_avatar.png'
import {
  IconSearch,
  IconBell,
  IconChevronDown,
  IconLogout,
} from '@tabler/icons-vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isProfileMenuOpen = ref(false)
const searchQuery = ref('')
provide('searchQuery', searchQuery)

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/admin') return 'Dashboard'
  if (path.startsWith('/admin/teachers')) return 'Teacher Management'
  if (path.startsWith('/admin/students')) return 'Student List'
  if (path.startsWith('/admin/tasks')) return 'Follow-Up Timeline'
  if (path.startsWith('/admin/courses')) return 'Course Management'
  if (path.startsWith('/admin/reports')) return 'Reports & Analytics'
  if (path.startsWith('/admin/settings')) return 'Follow-Up Type Management'
  if (path.startsWith('/admin/calendar')) return 'Calendar'
  return 'Admin Panel'
})

const handleLogout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 font-sans">
    <AdminSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Sticky Global Navbar (ultra-compact height to h-14 and padding to px-4) -->
      <nav class="h-14 bg-white border-b border-slate-50 flex items-center justify-between px-4 shrink-0 z-40 relative">
        <div class="flex items-center">
          <h1 class="text-lg font-black text-[#0f172a] tracking-tight transition-all">
            {{ pageTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <!-- Search Bar (ultra-compact width, height, padding, and text size) -->
          <div class="relative w-[240px] hidden md:block">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
            />
            <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <!-- Notification Bell (ultra-compact button and icon sizes) -->
          <button class="relative w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#64748b] border border-slate-50 hover:bg-gray-50 transition-colors">
            <IconBell class="w-4.5 h-4.5" />
            <span class="absolute top-1.5 right-2 w-1.5 h-1.5 bg-[#6366f1] rounded-full"></span>
          </button>

          <!-- Profile Card Dropdown (ultra-compact avatar, spacing, and typography) -->
          <div class="relative" v-click-outside="() => isProfileMenuOpen = false">
            <div
              @click="isProfileMenuOpen = !isProfileMenuOpen"
              class="flex items-center gap-2 bg-white p-1 pr-2.5 rounded-[5px] border border-slate-50 cursor-pointer hover:bg-gray-50 transition-colors select-none"
            >
              <img :src="tolaAvatar" class="w-7 h-7 rounded-full object-cover" alt="User avatar" />
              <div class="text-left leading-none hidden sm:block">
                <p class="text-xs font-black text-[#1e293b]">Omotola Hazyz</p>
                <div class="flex items-center gap-1 mt-0.5">
                  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span class="text-[9px] text-emerald-600 font-black uppercase tracking-wider">Online</span>
                </div>
              </div>
              <IconChevronDown class="w-3.5 h-3.5 text-[#64748b]" />
            </div>

            <!-- Profile Menu -->
            <div
              v-if="isProfileMenuOpen"
              class="absolute right-0 mt-1.5 w-44 bg-white border border-slate-50 rounded-[5px] shadow-lg py-1 z-50"
            >
              <button
                @click="handleLogout"
                class="flex w-full items-center gap-2 px-4 py-2 text-xs text-[#475569] hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <IconLogout class="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Scrollable Main Content (reduced padding to p-4) -->
      <main class="flex-1 overflow-auto p-4 bg-[#f8f9fa]">
        <slot>
          <RouterView />
        </slot>
      </main>
    </div>
  </div>
</template>
