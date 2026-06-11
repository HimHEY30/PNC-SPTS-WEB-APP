<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import {
  IconSearch,
  IconPlus,
  IconChevronRight,
  IconBook,
  IconCheck,
  IconClock,
  IconStar,
  IconPlayerPlay,
  IconDeviceMobile,
  IconCertificate,
  IconChartBar,
  IconLayout,
  IconCurrencyDollar,
  IconHeart,
  IconListCheck,
} from '@tabler/icons-vue'

interface Course {
  id: number
  image: string
  emoji: string
  title: string
  category: string
  academy: string
  academyLogo: string
  rating: number
  lessons: number
  price: number
  isLiked: boolean
  progress: number
  status: 'Ongoing' | 'Completed' | 'Paused'
  enrolled: number
  updated: string
  description: string
  includes: string[]
  whatWillLearn: string[]
}

const courses = ref<Course[]>([
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    emoji: '🧠',
    title: 'Business Analytics Fundamentals',
    category: 'Business Analysis',
    academy: 'JDG Academy',
    academyLogo: '🎓',
    rating: 4.8,
    lessons: 32,
    price: 49.00,
    isLiked: true,
    progress: 72,
    status: 'Ongoing',
    enrolled: 28,
    updated: '2 days ago',
    description: 'Master the fundamentals of business analytics and data-driven decision making.',
    includes: [
      '32 Videos by this Course',
      'Accessible on all mobile devices',
      'Access at any time',
      'Issue a certificate of course completion',
    ],
    whatWillLearn: [
      'Proficient in using analytics tools',
      'Design business dashboards',
      'Data visualization techniques',
      'Basic knowledge of BI',
    ],
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800',
    emoji: '🎨',
    title: 'Graphic Design & Branding',
    category: 'Design',
    academy: 'STK Academy',
    academyLogo: '🎨',
    rating: 4.5,
    lessons: 24,
    price: 35.00,
    isLiked: false,
    progress: 100,
    status: 'Completed',
    enrolled: 35,
    updated: '1 week ago',
    description: 'Learn the principles of graphic design and how to build a strong brand identity.',
    includes: [
      '24 Videos by this Course',
      'Accessible on all mobile devices',
      'Access at any time',
      'Issue a certificate of course completion',
    ],
    whatWillLearn: [
      'Proficient in using design tools such as Figma & AI',
      'Design mobile interface using Figma',
      'User experience design',
      'Basic knowledge of UI',
    ],
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1611974714608-66a33716a495?auto=format&fit=crop&q=80&w=800',
    emoji: '💱',
    title: 'Currency Markets Overview',
    category: 'Currency Trading',
    academy: 'LOA Academy',
    academyLogo: '💹',
    rating: 4.2,
    lessons: 16,
    price: 59.00,
    isLiked: false,
    progress: 48,
    status: 'Paused',
    enrolled: 19,
    updated: '4 days ago',
    description: 'Understand the global currency markets and how to trade forex successfully.',
    includes: [
      '16 Videos by this Course',
      'Accessible on all mobile devices',
      'Access at any time',
      'Issue a certificate of course completion',
    ],
    whatWillLearn: [
      'Analyze currency pairs',
      'Risk management in trading',
      'Technical analysis basics',
      'Economic indicator impacts',
    ],
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800',
    emoji: '📈',
    title: 'Sales & Marketing Strategy',
    category: 'Sales Marketing',
    academy: 'JDG Academy',
    academyLogo: '🎓',
    rating: 4.7,
    lessons: 22,
    price: 45.00,
    isLiked: true,
    progress: 83,
    status: 'Ongoing',
    enrolled: 42,
    updated: 'Yesterday',
    description: 'Develop high-impact sales and marketing strategies to grow any business.',
    includes: [
      '22 Videos by this Course',
      'Accessible on all mobile devices',
      'Access at any time',
      'Issue a certificate of course completion',
    ],
    whatWillLearn: [
      'Digital marketing fundamentals',
      'Sales funnel optimization',
      'Content marketing strategy',
      'Social media management',
    ],
  },
])

const selectedCourse = ref<Course>(courses.value[0])

const selectCourse = (course: Course) => {
  selectedCourse.value = course
}

const toggleLike = (courseId: number) => {
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    course.isLiked = !course.isLiked
  }
}

const courseSearchQuery = ref('')
const courseStatusFilter = ref<'All Status' | 'Ongoing' | 'Completed' | 'Paused'>('All Status')

const courseStatusOptions: DropdownOption[] = [
  { value: 'All Status', label: 'All Status' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Paused', label: 'Paused' },
]

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(courseSearchQuery.value.toLowerCase()) ||
      course.category.toLowerCase().includes(courseSearchQuery.value.toLowerCase())

    const matchesStatus =
      courseStatusFilter.value === 'All Status' || course.status === courseStatusFilter.value

    return matchesSearch && matchesStatus
  })
})

const totalCourses = computed(() => courses.value.length)
const activeCourses = computed(() =>
  courses.value.filter(course => course.status === 'Ongoing').length,
)
const completedCourses = computed(() =>
  courses.value.filter(course => course.status === 'Completed').length,
)
const averageProgress = computed(() => {
  if (!courses.value.length) return 0
  return Math.round(courses.value.reduce((sum, course) => sum + course.progress, 0) / courses.value.length)
})
</script>

<template>
  <div class="space-y-6 text-left max-w-[1600px] mx-auto pb-8 bg-[#f8f9fa] p-4 min-h-screen">
    <!-- Top Category Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="cat in [
          { name: 'Business Analytic', icon: IconChartBar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { name: 'Design', icon: IconLayout, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { name: 'Currency', icon: IconCurrencyDollar, color: 'text-amber-600', bg: 'bg-amber-50' },
          { name: 'Sale Marketing', icon: IconChartBar, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ]" 
        :key="cat.name"
        class="bg-white rounded-[3px] p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2 hover:shadow-md transition-shadow cursor-pointer"
      >
        <div :class="['p-2.5 rounded-full', cat.bg, cat.color]">
          <component :is="cat.icon" class="w-5 h-5" />
        </div>
        <h3 class="text-xs font-bold text-slate-800">{{ cat.name }}</h3>
        <p class="text-[9px] text-slate-400 leading-relaxed px-2">
          Invest in your future with our business analysis course
        </p>
      </div>
    </div>

    <!-- Main Dashboard Section -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      <!-- Featured Course (Left 9 Columns) -->
      <div class="xl:col-span-9 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 class="text-sm font-bold text-slate-800">Featured Course</h2>
          <div class="flex items-center gap-3">
            <div class="relative w-full md:w-56">
              <input 
                v-model="courseSearchQuery"
                type="text" 
                placeholder="Search courses..."
                class="w-full bg-[#f1f3f9] text-[#1e293b] rounded-[5px] py-1.5 pl-8 pr-3 text-xs border border-transparent outline-none focus:bg-[#f1f3f9]"
              />
              <IconSearch class="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <BaseDropdown v-model="courseStatusFilter" :options="courseStatusOptions" size="sm" position="right" />
            <button class="text-[10px] font-bold text-slate-400 hover:text-slate-600 shrink-0">See all</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="course in filteredCourses" 
            :key="course.id"
            @click="selectCourse(course)"
            class="bg-white rounded-[3px] overflow-hidden shadow-sm border border-slate-100 group cursor-pointer hover:shadow-md transition-all"
            :class="{ 'ring-1 ring-indigo-500': selectedCourse.id === course.id }"
          >
            <!-- Course Image Container -->
            <div class="relative h-32">
              <img :src="course.image" :alt="course.title" class="w-full h-full object-cover" />
              <!-- Like Heart -->
              <button 
                @click.stop="toggleLike(course.id)"
                class="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-colors"
                :class="course.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'"
              >
                <IconHeart class="w-3 h-3" :fill="course.isLiked ? 'currentColor' : 'none'" />
              </button>
              <!-- Category Badge -->
              <div class="absolute bottom-2 left-2">
                <span class="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded-[2px] shadow-sm uppercase">
                  {{ course.category.split(' ')[0] }}
                </span>
              </div>
            </div>

            <!-- Course Info -->
            <div class="p-3 space-y-3">
              <h3 class="text-xs font-bold text-slate-800 line-clamp-2 leading-tight h-8">
                {{ course.title }}
              </h3>
              
              <div class="flex items-center justify-between text-[10px]">
                <div class="flex items-center gap-1.5">
                  <span class="text-base">{{ course.academyLogo }}</span>
                  <span class="font-bold text-slate-500">{{ course.academy }}</span>
                </div>
                <div class="flex items-center gap-0.5 text-amber-400">
                  <span class="font-bold text-slate-400">{{ course.rating }}</span>
                  <IconStar class="w-3 h-3 fill-current" />
                </div>
              </div>

              <div class="flex items-center justify-between pt-1 border-t border-slate-50">
                <div class="flex items-center gap-1.5 text-slate-400 font-bold text-[9px]">
                  <IconListCheck class="w-3 h-3" />
                  <span>{{ course.lessons }} Lessons</span>
                </div>
                <div class="text-indigo-600 font-bold text-xs">
                  $ {{ course.price.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Course Panel (Right 3 Columns) -->
      <div class="xl:col-span-3">
        <div class="bg-white rounded-[3px] p-4 shadow-sm border border-slate-100 space-y-4 sticky top-4">
          <h2 class="text-sm font-bold text-slate-800">Detail Course</h2>

          <!-- Detail Preview Image -->
          <div class="relative rounded-[3px] overflow-hidden group cursor-pointer h-36">
            <img :src="selectedCourse.image" :alt="selectedCourse.title" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
              <button class="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full font-bold text-[10px] text-slate-800 shadow-lg hover:bg-white transition-colors">
                <IconPlayerPlay class="w-3 h-3 fill-slate-800" />
                Preview Video
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="text-xs font-bold text-slate-800 leading-tight">
              {{ selectedCourse.title }}
            </h3>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-base">{{ selectedCourse.academyLogo }}</span>
                <span class="text-[10px] font-bold text-slate-400">{{ selectedCourse.academy }}</span>
              </div>
              <div class="text-indigo-600 font-bold text-sm">
                $ {{ selectedCourse.price.toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Course Included -->
          <div class="space-y-3">
            <h4 class="text-[11px] font-bold text-slate-800">Course included</h4>
            <ul class="space-y-2">
              <li 
                v-for="(item, idx) in selectedCourse.includes" 
                :key="idx"
                class="flex items-center gap-2.5 text-[10px] text-slate-500 font-bold"
              >
                <component 
                  :is="[IconPlayerPlay, IconDeviceMobile, IconClock, IconCertificate][idx % 4]" 
                  class="w-3.5 h-3.5 text-slate-400" 
                />
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- What you will learn -->
          <div class="space-y-3 pt-1">
            <h4 class="text-[11px] font-bold text-slate-800">What you will learn?</h4>
            <ul class="space-y-2">
              <li 
                v-for="(item, idx) in selectedCourse.whatWillLearn" 
                :key="idx"
                class="flex items-start gap-2.5 text-[10px] text-slate-500 font-bold leading-tight"
              >
                <IconCheck class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
