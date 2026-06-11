<script setup lang="ts">
import { ref } from 'vue'
import {
  IconGlobe,
  IconBook,
  IconCalendar,
  IconMail,
  IconNews,
  IconUserCheck,
  IconFileText,
  IconExternalLink,
  IconLibrary,
  IconCertificate,
  IconBriefcase,
  IconUsers,
  IconMessage,
} from '@tabler/icons-vue'

interface PortalLink {
  title: string
  description: string
  url: string
  icon: object
  color: string
  category: string
}

const portalLinks = ref<PortalLink[]>([
  { title: 'PNC Official Website', description: 'Main institution website with news, programs, and admissions', url: 'https://www.pnc.edu.kh', icon: IconGlobe, color: 'bg-blue-50 text-blue-600', category: 'Institution' },
  { title: 'Student Portal', description: 'Access grades, schedules, attendance records, and personal info', url: 'https://student.pnc.edu.kh', icon: IconUserCheck, color: 'bg-emerald-50 text-emerald-600', category: 'Student' },
  { title: 'E-Learning Platform', description: 'Online courses, learning materials, and virtual classrooms', url: 'https://elearning.pnc.edu.kh', icon: IconBook, color: 'bg-purple-50 text-purple-600', category: 'Academic' },
  { title: 'Library System', description: 'Digital library catalog, research databases, and resources', url: 'https://library.pnc.edu.kh', icon: IconLibrary, color: 'bg-amber-50 text-amber-600', category: 'Academic' },
  { title: 'Academic Calendar', description: 'Key dates, term schedules, exams, and holidays', url: 'https://www.pnc.edu.kh/academic-calendar', icon: IconCalendar, color: 'bg-rose-50 text-rose-600', category: 'Academic' },
  { title: 'Staff Email', description: 'Webmail access for faculty and administrative staff', url: 'https://mail.pnc.edu.kh', icon: IconMail, color: 'bg-sky-50 text-sky-600', category: 'Staff' },
  { title: 'Job Placement', description: 'Career opportunities, internships, and employer partnerships', url: 'https://career.pnc.edu.kh', icon: IconBriefcase, color: 'bg-indigo-50 text-indigo-600', category: 'Student' },
  { title: 'News & Events', description: 'Latest announcements, events, and institutional updates', url: 'https://www.pnc.edu.kh/news', icon: IconNews, color: 'bg-orange-50 text-orange-600', category: 'Institution' },
  { title: 'Certificate Verification', description: 'Verify student certificates and academic credentials', url: 'https://verify.pnc.edu.kh', icon: IconCertificate, color: 'bg-teal-50 text-teal-600', category: 'Academic' },
  { title: 'Faculty Directory', description: 'Contact information and profiles of faculty members', url: 'https://www.pnc.edu.kh/faculty', icon: IconUsers, color: 'bg-cyan-50 text-cyan-600', category: 'Staff' },
  { title: 'IT Support', description: 'Technical support, password reset, and system access requests', url: 'https://support.pnc.edu.kh', icon: IconMessage, color: 'bg-slate-50 text-slate-600', category: 'Staff' },
  { title: 'Document Repository', description: 'Policy documents, forms, templates, and official downloads', url: 'https://docs.pnc.edu.kh', icon: IconFileText, color: 'bg-violet-50 text-violet-600', category: 'Institution' },
])

const categories = [...new Set(portalLinks.value.map(l => l.category))]
const selectedCategory = ref('')

const filteredLinks = computed(() => {
  if (!selectedCategory.value) return portalLinks.value
  return portalLinks.value.filter(l => l.category === selectedCategory.value)
})

import { computed } from 'vue'

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: portalLinks.value.length }
  portalLinks.value.forEach(l => {
    counts[l.category] = (counts[l.category] || 0) + 1
  })
  return counts
})

const openLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <div class="space-y-5 text-left">
    <div class="flex items-center justify-between">
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{{ portalLinks.length }} portal links</p>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        @click="selectedCategory = ''"
        class="rounded-[5px] px-3 py-1.5 text-[10px] font-bold transition-all border"
        :class="!selectedCategory ? 'bg-[#3b4b6b] text-white border-[#3b4b6b]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
      >
        All ({{ categoryCounts.all }})
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        @click="selectedCategory = cat"
        class="rounded-[5px] px-3 py-1.5 text-[10px] font-bold transition-all border"
        :class="selectedCategory === cat ? 'bg-[#3b4b6b] text-white border-[#3b4b6b]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
      >
        {{ cat }} ({{ categoryCounts[cat] }})
      </button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="link in filteredLinks"
        :key="link.title"
        @click="openLink(link.url)"
        class="bg-white rounded-[5px] border border-slate-100 shadow-md hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer group overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px]" :class="link.color">
              <component :is="link.icon" class="h-5 w-5" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <p class="font-bold text-xs text-[#0f172a] group-hover:text-[#3b4b6b] transition-colors">{{ link.title }}</p>
                <IconExternalLink class="h-3 w-3 text-slate-300 group-hover:text-[#3b4b6b] transition-colors shrink-0" />
              </div>
              <p class="text-[10px] text-slate-500 mt-1 leading-relaxed">{{ link.description }}</p>
              <span
                class="inline-flex items-center rounded-[3px] bg-slate-100 text-slate-500 px-2 py-0.5 text-[9px] font-bold mt-2 border border-slate-200"
              >
                {{ link.category }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
