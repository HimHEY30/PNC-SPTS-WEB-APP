<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  IconLayoutDashboard,
  IconUsers,
  IconGitFork,
  IconListCheck,
  IconCalendar,
  IconTarget,
  IconBook,
  IconBriefcase,
  IconChartBar,
  IconGlobe,
  IconChevronRight,
  IconChevronLeft,
  IconLogout,
} from '@tabler/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import logoSrc from '@/assets/images/logo1.png'

const route = useRoute()
const auth = useAuthStore()
const router = useRouter()

const collapsed = ref(false)

// Reorganized categories and menu links matching the HEITKAMP CRM
const menuGroups = [
  {
    title: 'Menu',
    items: [
      { to: '/admin', label: 'Dashboard', icon: IconLayoutDashboard, exact: true },
      { to: '/admin/students', label: 'Student List', icon: IconUsers },
      { to: '/admin/courses', label: 'Enrolled Courses', icon: IconGitFork },
    ],
  },
  {
    title: 'Productivity',
    items: [
      { to: '/admin/tasks', label: 'Follow-Up Timeline', icon: IconListCheck },
      { to: '/admin/calendar', label: 'Calendar', icon: IconCalendar },
      { to: '/admin/goals', label: 'Goal Setting', icon: IconTarget },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/admin/teachers', label: 'Teacher Management', icon: IconBook },
      { to: '/admin/active', label: 'Active Follow-Ups', icon: IconBriefcase },
      { to: '/admin/reports', label: 'Reports', icon: IconChartBar },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { to: '/admin/website', label: 'PNC Portal', icon: IconGlobe },
      { to: '/admin/settings', label: 'Follow-Up Type Management', icon: IconBook },
    ],
  },
]

const isActive = (to: string, exact?: boolean) => {
  if (exact) {
    return route.path === to
  }
  return route.path.startsWith(to) && (route.path === to || route.path[to.length] === '/')
}

const getLinkClass = (to: string, exact?: boolean) => {
  const active = isActive(to, exact)
  return [
    'flex items-center transition-all duration-200 select-none overflow-hidden rounded-[3px]',
    collapsed.value 
      ? 'justify-center p-2 mx-auto w-9 h-9' 
      : 'gap-2.5 px-3 py-2 text-xs font-bold mx-2',
    active
      ? 'bg-[#3b4b6b] text-white shadow-sm'
      : 'text-[#475569] hover:bg-slate-100 hover:text-[#0f172a]',
  ]
}

const handleLogout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <aside
    class="flex shrink-0 flex-col bg-white text-slate-800 border-r border-slate-100 transition-all duration-300"
    :class="collapsed ? 'w-16' : 'w-60'"
  >
    <!-- Brand / Logo Header -->
    <div 
      class="flex h-14 items-center transition-all duration-300 overflow-hidden"
      :class="collapsed ? 'justify-center' : 'gap-3 px-4 border-b border-slate-50'"
    >
      <!-- Custom Logo (adjusted to w-9 h-9) -->
      <img :src="logoSrc" class="w-9 h-9 object-contain shrink-0" alt="Logo" />
      <div v-show="!collapsed" class="min-w-0 flex-1 text-left">
        <p class="text-xs font-black text-[#0f172a] tracking-widest uppercase leading-none">PNC SPTS</p>
      </div>
      <button
        v-show="!collapsed"
        @click="collapsed = !collapsed"
        class="ml-auto shrink-0 rounded-[3px] p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
      >
        <IconChevronLeft class="h-4 w-4" />
      </button>
    </div>

    <!-- Toggle Button for collapsed state -->
    <div v-if="collapsed" class="flex justify-center py-1 border-b border-slate-50 bg-slate-50/30">
      <button @click="collapsed = !collapsed" class="text-slate-300 hover:text-slate-500 transition-colors">
        <IconChevronRight class="h-4 w-4" />
      </button>
    </div>

    <!-- Scrollable Navigation menu -->
    <nav class="flex-1 overflow-auto space-y-4 text-left scrollbar-thin pt-4">
      <div v-for="group in menuGroups" :key="group.title" class="space-y-1">
        <!-- Group Header title -->
        <p
          v-show="!collapsed"
          class="px-5 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none mb-1"
        >
          {{ group.title }}
        </p>

        <!-- Group Nav links list -->
        <ul class="space-y-0.5">
          <li v-for="item in group.items" :key="item.to">
            <router-link
              :to="item.to"
              :class="getLinkClass(item.to, item.exact)"
              :title="collapsed ? item.label : ''"
            >
              <component :is="item.icon" class="h-4 w-4 shrink-0" />
              <span v-show="!collapsed" class="flex-1 whitespace-nowrap text-xs">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Logout section -->
    <div class="border-t border-slate-50 p-2">
      <button
        @click="handleLogout"
        class="flex items-center transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 overflow-hidden rounded-[3px]"
        :class="collapsed ? 'justify-center p-2 mx-auto w-9 h-9' : 'w-full gap-2.5 px-3 py-2 text-xs font-bold text-slate-500'"
        :title="collapsed ? 'Logout' : ''"
      >
        <IconLogout class="h-4 w-4 shrink-0" />
        <span v-show="!collapsed" class="text-xs">Logout</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* Thin scrollbar for sidebar */
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
</style>
