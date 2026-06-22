<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoSrc from '@/assets/images/logo1.png'
import {
  IconSearch,
  IconBell,
  IconHelpCircle,
  IconLayoutBoard,
  IconExternalLink,
  IconPlus,
  IconFolderPlus,
  IconBolt,
  IconBulb,
  IconStar,
  IconUsers,
  IconUserPlus,
  IconDots,
  IconArchive,
  IconEdit,
  IconInbox,
  IconCalendarMonth,
  IconGridDots,
  IconSparkles,
  IconX,
  IconBook,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconAward,
  IconAlignLeft,
  IconTags,
  IconClock,
  IconListCheck,
  IconMessage,
  IconEye,

} from '@tabler/icons-vue'

const auth = useAuthStore()
const router = useRouter()

import BaseDropdown from '@/components/ui/dropdowns/BaseDropdown.vue'
import type { DropdownOption } from '@/components/ui/dropdowns/BaseDropdown.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'

const priorityOptions: DropdownOption[] = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

const typeOptions: DropdownOption[] = [
  { value: 'Academic', label: 'Academic' },
  { value: 'Attendance', label: 'Attendance' },
  { value: 'Behaviour', label: 'Behaviour' },
  { value: 'Achievement', label: 'Achievement' },
  { value: 'Pastoral Care', label: 'Pastoral Care' },
]

const classOptions: DropdownOption[] = [
  { value: 'WEB C', label: 'WEB C' },
  { value: 'WEB B', label: 'WEB B' },
  { value: 'SNA C', label: 'SNA C' },
  { value: 'SNA B', label: 'SNA B' },
]

const genderOptions: DropdownOption[] = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
]

const statusOptions: DropdownOption[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Graduated', label: 'Graduated' },
]

const avatarRef = ref<HTMLElement | null>(null)
const isProfileMenuOpen = ref(false)

const dropdownStyle = computed(() => {
  if (!avatarRef.value) return {}
  const rect = avatarRef.value.getBoundingClientRect()
  return {
    top: `${rect.bottom + 4}px`,
    right: `${window.innerWidth - rect.right}px`,
  }
})
const isBoardMemberMenuOpen = ref(false)
const openCardMenuId = ref<number | null>(null)
const openListMenuId = ref<number | null>(null)
const editingListTitleId = ref<number | null>(null)
const editListTitleText = ref('')
const addingCardToListId = ref<number | null>(null)
const newCardTitle = ref('')

const isAddingList = ref(false)
const newListTitle = ref('')

function toggleAddList(show: boolean) {
  isAddingList.value = show
  newListTitle.value = ''
}

function addList() {
  if (!newListTitle.value.trim()) return
  lists.value.push({
    id: Date.now(),
    title: newListTitle.value.trim(),
    color: 'bg-slate-100/90 border border-slate-200/50',
    cards: [],
  })
  newListTitle.value = ''
  isAddingList.value = false
}

function startEditListTitle(list: List) {
  editingListTitleId.value = list.id
  editListTitleText.value = list.title
  openListMenuId.value = null
}

function saveListTitle() {
  if (editingListTitleId.value && editListTitleText.value.trim()) {
    const list = lists.value.find(l => l.id === editingListTitleId.value)
    if (list) {
      list.title = editListTitleText.value.trim()
    }
  }
  editingListTitleId.value = null
}

const isEditCardModalOpen = ref(false)
const editingCardId = ref<number | null>(null)
const editingListId = ref<number | null>(null)
const editingListTitle = computed(() => {
  const list = lists.value.find((l) => l.id === editingListId.value)
  return list ? list.title : ''
})
const editForm = reactive({
  student: '',
  teacher: '',
  subject: '',
  description: '',
  priority: 'Medium' as 'Critical' | 'High' | 'Medium' | 'Low',
  type: 'Academic',
})

// Student profile mockup database
const studentProfiles = ref<Record<string, {
  name: string
  studentCode: string
  class: string
  gender: string
  status: 'Active' | 'Suspended' | 'Graduated'
  email: string
  phone: string
  placeOfBirth: string
  award: string
}>>({
  'Phanith Lim': {
    name: 'Phanith Lim',
    studentCode: 'PNC2025-002',
    class: 'WEB C',
    gender: 'Male',
    status: 'Active',
    email: 'phanith.lim@student.passerellesnumeriques.org',
    phone: '+855 12 345 678',
    placeOfBirth: 'Battambang',
    award: 'Most Improved Student',
  },
  'Bona Chen': {
    name: 'Bona Chen',
    studentCode: 'PNC2025-003',
    class: 'WEB B',
    gender: 'Male',
    status: 'Active',
    email: 'bona.chen@student.passerellesnumeriques.org',
    phone: '+855 98 765 432',
    placeOfBirth: 'Siem Reap',
    award: 'Creative Thinker Award',
  },
  'Leakhena Meas': {
    name: 'Leakhena Meas',
    studentCode: 'PNC2025-004',
    class: 'WEB C',
    gender: 'Female',
    status: 'Active',
    email: 'leakhena.meas@student.passerellesnumeriques.org',
    phone: '+855 87 654 321',
    placeOfBirth: 'Kampong Cham',
    award: 'Outstanding Punctuality Award',
  },
  'Vannak Soy': {
    name: 'Vannak Soy',
    studentCode: 'PNC2025-001',
    class: 'WEB C',
    gender: 'Male',
    status: 'Active',
    email: 'vannak.soy@student.passerellesnumeriques.org',
    phone: '+855 92 333 064',
    placeOfBirth: 'Kampong Cham',
    award: 'Perfect Attendance Award',
  },
  'Sopheak Mom': {
    name: 'Sopheak Mom',
    studentCode: 'PNC2025-005',
    class: 'WEB B',
    gender: 'Female',
    status: 'Active',
    email: 'sopheak.mom@student.passerellesnumeriques.org',
    phone: '+855 11 222 333',
    placeOfBirth: 'Prey Veng',
    award: 'Student of the Year',
  },
  'Tola Heang': {
    name: 'Tola Heang',
    studentCode: 'PNC2025-006',
    class: 'WEB B',
    gender: 'Male',
    status: 'Active',
    email: 'tola.heang@student.passerellesnumeriques.org',
    phone: '+855 77 888 999',
    placeOfBirth: 'Kandal',
    award: 'Lab Excellence Award',
  },
  'Minea Vong': {
    name: 'Minea Vong',
    studentCode: 'PNC2025-007',
    class: 'WEB C',
    gender: 'Male',
    status: 'Active',
    email: 'minea.vong@student.passerellesnumeriques.org',
    phone: '+855 88 999 000',
    placeOfBirth: 'Phnom Penh',
    award: 'Cybersecurity Merit Award',
  },
  'Ratha Kim': {
    name: 'Ratha Kim',
    studentCode: 'PNC2025-008',
    class: 'WEB B',
    gender: 'Male',
    status: 'Graduated',
    email: 'ratha.kim@student.passerellesnumeriques.org',
    phone: '+855 12 999 888',
    placeOfBirth: 'Takeo',
    award: 'PNC Scholarship Recipient',
  }
})

function getStudentProfile(name: string) {
  const normalizedName = name.trim()
  if (!studentProfiles.value[normalizedName]) {
    studentProfiles.value[normalizedName] = {
      name: normalizedName,
      studentCode: 'PNC2025-' + Math.floor(100 + Math.random() * 900),
      class: 'WEB C',
      gender: 'Male',
      status: 'Active',
      email: `${normalizedName.toLowerCase().replace(/\s+/g, '.')}@student.passerellesnumeriques.org`,
      phone: '+855 12 000 000',
      placeOfBirth: 'Cambodia',
      award: 'Perfect Attendance Award',
    }
  }
  return studentProfiles.value[normalizedName]
}

const isStudentCardModalOpen = ref(false)
const originalStudentName = ref('')
const editingStudentForm = reactive({
  name: '',
  studentCode: '',
  class: 'WEB C',
  gender: 'Male',
  status: 'Active' as 'Active' | 'Suspended' | 'Graduated',
  email: '',
  phone: '',
  placeOfBirth: '',
  award: '',
})

function openStudentCardModal(studentName: string) {
  const profile = getStudentProfile(studentName)
  originalStudentName.value = profile.name
  editingStudentForm.name = profile.name
  editingStudentForm.studentCode = profile.studentCode
  editingStudentForm.class = profile.class
  editingStudentForm.gender = profile.gender
  editingStudentForm.status = profile.status
  editingStudentForm.email = profile.email
  editingStudentForm.phone = profile.phone
  editingStudentForm.placeOfBirth = profile.placeOfBirth
  editingStudentForm.award = profile.award
  isStudentCardModalOpen.value = true
  isEditCardModalOpen.value = false // close case edit modal if open
}

function saveStudentCardEdit() {
  const oldName = originalStudentName.value.trim()
  const newName = editingStudentForm.name.trim()

  if (!newName) return

  const profileData = {
    name: newName,
    studentCode: editingStudentForm.studentCode.trim(),
    class: editingStudentForm.class,
    gender: editingStudentForm.gender,
    status: editingStudentForm.status,
    email: editingStudentForm.email.trim(),
    phone: editingStudentForm.phone.trim(),
    placeOfBirth: editingStudentForm.placeOfBirth.trim(),
    award: editingStudentForm.award.trim(),
  }

  if (oldName !== newName) {
    delete studentProfiles.value[oldName]
    // update all references in cards
    lists.value.forEach((list) => {
      list.cards.forEach((card) => {
        if (card.student === oldName) {
          card.student = newName
        }
      })
    })
  }

  studentProfiles.value[newName] = profileData
  isStudentCardModalOpen.value = false
}

const statusBadgeClass = (s: string) => {
  switch (s) {
    case 'Active':
      return 'bg-emerald-500/20 text-emerald-350 border border-emerald-500/30'
    case 'Suspended':
      return 'bg-amber-500/20 text-amber-350 border border-amber-500/30'
    case 'Graduated':
      return 'bg-blue-500/20 text-blue-350 border border-blue-500/30'
    default:
      return 'bg-slate-500/20 text-slate-350 border border-slate-500/30'
  }
}

const newCommentText = ref('')
const isWatching = ref(true)

interface Activity {
  id: number
  user: string
  text: string
  time: string
}

const caseActivities = ref<Activity[]>([])

function addComment() {
  const textVal = newCommentText.value.trim()
  const cleanedText = textVal.replace(/<[^>]*>/g, '').trim()
  if (!cleanedText) return
  
  caseActivities.value.unshift({
    id: Date.now(),
    user: 'Le thean Seourn',
    text: `commented: "${textVal}"`,
    time: 'Just now',
  })
  newCommentText.value = ''
}



function openEditCardModal(card: Card, listId: number) {
  editingCardId.value = card.id
  editingListId.value = listId
  editForm.student = card.student
  editForm.teacher = card.teacher
  editForm.subject = card.subject
  editForm.description = card.description
  editForm.priority = card.priority
  editForm.type = card.type
  
  // Set mock activity history based on card properties
  caseActivities.value = [
    {
      id: 1,
      user: card.teacher,
      text: `updated this case details: "${card.subject}"`,
      time: card.lastUpdate,
    },
    {
      id: 2,
      user: 'Le thean Seourn',
      text: `created this case and assigned it to ${card.teacher}`,
      time: `Opened on ${card.openedDate}`,
    }
  ]
  newCommentText.value = ''
  isWatching.value = true

  isEditCardModalOpen.value = true
  openCardMenuId.value = null
}

function saveCardEdit() {
  const list = lists.value.find((l) => l.id === editingListId.value)
  if (list) {
    const card = list.cards.find((c) => c.id === editingCardId.value)
    if (card) {
      const oldStudent = card.student
      const newStudent = editForm.student.trim()
      
      card.student = newStudent
      card.teacher = editForm.teacher.trim()
      card.subject = editForm.subject.trim()
      card.description = editForm.description.trim()
      card.priority = editForm.priority
      card.type = editForm.type

      if (oldStudent !== newStudent && newStudent) {
        if (studentProfiles.value[oldStudent]) {
          const profile = { ...studentProfiles.value[oldStudent], name: newStudent }
          delete studentProfiles.value[oldStudent]
          studentProfiles.value[newStudent] = profile
        }
      }
    }
  }
  isEditCardModalOpen.value = false
  editingCardId.value = null
  editingListId.value = null
}

function archiveCard(cardId: number, listId: number) {
  const list = lists.value.find((l) => l.id === listId)
  if (list) {
    const cardIndex = list.cards.findIndex((c) => c.id === cardId)
    if (cardIndex !== -1) {
      list.cards.splice(cardIndex, 1)
    }
  }
  openCardMenuId.value = null
}

const onDragStart = (e: DragEvent, card: Card, fromListId: number) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('cardId', card.id.toString())
    e.dataTransfer.setData('fromListId', fromListId.toString())
    e.dataTransfer.effectAllowed = 'move'
  }
}

const onDrop = (e: DragEvent, toListId: number) => {
  const cardId = Number(e.dataTransfer?.getData('cardId') || '0')
  const fromListId = Number(e.dataTransfer?.getData('fromListId') || '0')

  if (fromListId === toListId) return

  const fromList = lists.value.find((l) => l.id === fromListId)
  const toList = lists.value.find((l) => l.id === toListId)

  if (fromList && toList) {
    const cardIndex = fromList.cards.findIndex((c) => c.id === cardId)
    if (cardIndex !== -1) {
      const [card] = fromList.cards.splice(cardIndex, 1)
      toList.cards.push(card)
    }
  }
}

const toggleAddCard = (listId: number | null) => {
  addingCardToListId.value = listId
  newCardTitle.value = ''
}

const addCard = (listId: number) => {
  if (!newCardTitle.value.trim()) return
  const list = lists.value.find((l) => l.id === listId)
  if (list) {
    list.cards.push({
      id: Date.now(),
      student: newCardTitle.value.trim(),
      teacher: auth.user?.name || 'Ms. Chantrea Keo',
      type: 'Academic',
      priority: 'Medium',
      subject: 'New Follow-Up Case',
      openedDate: new Date().toISOString().split('T')[0],
      lastUpdate: 'Just now',
      description: 'Pending case details and review.',
    })
    toggleAddCard(null)
  }
}

interface Card {
  id: number
  student: string
  teacher: string
  type: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  subject: string
  openedDate: string
  lastUpdate: string
  description: string
}

interface List {
  id: number
  title: string
  cards: Card[]
  color: string
}

const lists = ref<List[]>([
  {
    id: 1,
    title: 'Open Cases',
    color: 'bg-slate-100/90 border border-slate-200/50',
    cards: [
      {
        id: 2,
        student: 'Phanith Lim',
        teacher: 'Mr. Dara Heng',
        type: 'Attendance',
        priority: 'Medium',
        subject: 'Inconsistent attendance',
        openedDate: '2026-06-05',
        lastUpdate: '3 hours ago',
        description: 'Has missed 4 classes this month. Meeting scheduled with parents.',
      },
      {
        id: 4,
        student: 'Bona Chen',
        teacher: 'Mr. Vuthy Long',
        type: 'Behaviour',
        priority: 'High',
        subject: 'Lab behavioral issues',
        openedDate: '2026-06-07',
        lastUpdate: '1 day ago',
        description: 'Disruptive behavior during lab sessions. Counselor referral initiated.',
      },
      {
        id: 8,
        student: 'Leakhena Meas',
        teacher: 'Ms. Socheata Lim',
        type: 'Academic',
        priority: 'Medium',
        subject: 'Low group participation',
        openedDate: '2026-06-06',
        lastUpdate: '3 days ago',
        description: 'Reluctant to participate in group activities. Developing engagement plan.',
      },
    ],
  },
  {
    id: 2,
    title: 'In Progress',
    color: 'bg-slate-100/90 border border-slate-200/50',
    cards: [
      {
        id: 1,
        student: 'Vannak Soy',
        teacher: 'Ms. Chantrea Keo',
        type: 'Academic',
        priority: 'Low',
        subject: 'Grade improvement in Web Dev',
        openedDate: '2026-06-01',
        lastUpdate: '2 hours ago',
        description: 'Student showing steady improvement in JavaScript fundamentals. Needs additional practice with APIs.',
      },
      {
        id: 3,
        student: 'Sopheak Mom',
        teacher: 'Ms. Theary Sok',
        type: 'Achievement',
        priority: 'High',
        subject: 'Exceptional project performance',
        openedDate: '2026-06-03',
        lastUpdate: '5 hours ago',
        description: 'Student excelled in mobile app project. Considering for advanced track.',
      },
      {
        id: 6,
        student: 'Tola Heang',
        teacher: 'Mr. Samnang Tep',
        type: 'Pastoral Care',
        priority: 'Medium',
        subject: 'Counseling request',
        openedDate: '2026-06-02',
        lastUpdate: '2 days ago',
        description: 'Student requested personal counseling. Sessions ongoing.',
      },
      {
        id: 7,
        student: 'Minea Vong',
        teacher: 'Mr. Rithy Chhum',
        type: 'Achievement',
        priority: 'Critical',
        subject: 'Cybersecurity award',
        openedDate: '2026-06-08',
        lastUpdate: '2 days ago',
        description: 'Student won inter-university CTF competition. Nominating for scholarship.',
      },
    ],
  },
  {
    id: 3,
    title: 'Resolved',
    color: 'bg-slate-100/90 border border-slate-200/50',
    cards: [
      {
        id: 5,
        student: 'Ratha Kim',
        teacher: 'Ms. Kanha Phan',
        type: 'Academic',
        priority: 'Low',
        subject: 'Late assignments',
        openedDate: '2026-05-20',
        lastUpdate: '1 day ago',
        description: 'Student has caught up on all pending assignments. Case closed.',
      },
    ],
  },
])

const searchQuery = ref('')
const filteredLists = computed(() => {
  if (!searchQuery.value.trim()) {
    return lists.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return lists.value.map((list) => {
    return {
      ...list,
      cards: list.cards.filter(
        (card) =>
          card.student.toLowerCase().includes(query) ||
          card.subject.toLowerCase().includes(query) ||
          card.teacher.toLowerCase().includes(query)
      ),
    }
  })
})

const priorityClass = (p: string) => {
  switch (p) {
    case 'Critical':
      return 'bg-rose-50 text-rose-600 border-rose-100'
    case 'High':
      return 'bg-orange-50 text-orange-600 border-orange-100'
    case 'Medium':
      return 'bg-amber-50 text-amber-600 border-amber-100'
    case 'Low':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    default:
      return 'bg-slate-50 text-slate-400 border-slate-100'
  }
}

const typeClass = (type: string) => {
  const t = type || ''
  if (t.includes('Academic')) return 'bg-purple-50 text-purple-700 border-purple-100'
  if (t.includes('Attendance')) return 'bg-blue-50 text-blue-700 border-blue-100'
  if (t.includes('Behaviour') || t.includes('Behavior')) return 'bg-rose-50 text-rose-700 border-rose-100'
  if (t.includes('Achievement')) return 'bg-amber-50 text-amber-700 border-amber-100'
  if (t.includes('Pastoral')) return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  return 'bg-slate-50 text-slate-500 border-slate-100'
}



const handleLogout = () => {
  auth.logout()
  router.push('/')
}

const userInitials = computed(() => {
  const name = auth.user?.name || ''
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})
</script>

<template>
  <div
    class="h-screen w-screen flex flex-col bg-[#311B73] text-slate-800 relative no-scrollbar"
  >
    <!-- Top Navbar (Sticky) -->

    <nav
      class="h-12 bg-white flex items-center justify-between px-4 shrink-0 border-b border-slate-200 z-50 sticky top-0 text-slate-700"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <img :src="logoSrc" class="h-7" alt="Logo" />
          <span class="text-sm font-semibold text-slate-800" style="font-family: 'Exo 2', sans-serif; letter-spacing: 0.5px">Student Follow-Up System</span>
        </div>
        <div class="relative w-[240px] hidden md:block">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search cards..."
            class="w-full bg-slate-100 border border-slate-200 text-slate-850 placeholder-slate-400 rounded-[5px] py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-slate-400 transition-all"
          />
          <IconSearch class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <button
          class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1 rounded-[3px] text-xs transition-colors"
        >
          Create
        </button>
      </div>

      <div class="flex items-center gap-3">
        <router-link
          to="/admin"
          class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1 rounded-[3px] text-xs transition-colors"
        >
          Admin
        </router-link>
        <div
          class="bg-purple-50 text-purple-700 text-[11px] font-bold px-2 py-1 rounded-[3px] flex items-center gap-1 border border-purple-100"
        >
          <IconSparkles class="w-3.5 h-3.5 text-purple-600" />
          9 days left
        </div>
        <button class="text-slate-500 hover:text-slate-700 transition-opacity p-1.5">
          <IconBell class="w-5 h-5" />
        </button>
        <button class="text-slate-500 hover:text-slate-700 transition-opacity p-1.5">
          <IconHelpCircle class="w-5 h-5" />
        </button>
        <div
          ref="avatarRef"
          @click="isProfileMenuOpen = !isProfileMenuOpen"
          class="w-8 h-8 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-sm text-white cursor-pointer hover:brightness-110 transition-all border-2 border-slate-100 overflow-hidden"
        >
          <img
            v-if="auth.user?.profile_image"
            :src="auth.user.profile_image"
            @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            class="w-full h-full object-cover"
            alt="User avatar"
          />
          <span v-else>{{ userInitials }}</span>
        </div>

        <Teleport to="body">
          <div
            v-if="isProfileMenuOpen"
            class="fixed inset-0 z-40"
            @click="isProfileMenuOpen = false"
          ></div>
          <div
            v-if="isProfileMenuOpen"
            class="fixed z-50 w-80 bg-white border border-slate-200 rounded-[8px] shadow-2xl p-3 text-slate-700"
            :style="dropdownStyle"
            @click.stop
          >
            <div class="px-2 py-1">
              <p class="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider px-1">
                Account
              </p>
              <div class="flex items-center gap-3 mb-2 px-1">
                <div
                  class="w-10 h-10 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-lg text-white shrink-0 overflow-hidden"
                >
                  <img
                    v-if="auth.user?.profile_image"
                    :src="auth.user.profile_image"
                    @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
                    class="w-full h-full object-cover"
                    alt="User avatar"
                  />
                  <span v-else>{{ userInitials }}</span>
                </div>
                <div class="overflow-hidden">
                  <p class="text-sm font-bold text-slate-800 truncate">
                    {{ auth.user?.name || 'User' }}
                  </p>
                  <p class="text-[11px] text-slate-500 truncate">{{ auth.user?.email || '' }}</p>
                </div>
              </div>
              <button class="light-drop-item w-full">Switch accounts</button>
              <button class="light-drop-item w-full flex items-center justify-between">
                Manage account <IconExternalLink class="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>

            <div class="border-t border-slate-100 mx-2 my-1"></div>

            <div class="px-2 py-1">
              <p class="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider px-1">
                Settings
              </p>
              <button class="light-drop-item w-full">Profile</button>
              <button class="light-drop-item w-full">About</button>
            </div>

            <div class="border-t border-slate-100 mx-2 my-1"></div>

            <div class="px-2 py-1">
              <button class="light-drop-item w-full flex items-center gap-2">
                <IconUsers class="w-4 h-4" />Create Workspace
              </button>
            </div>

            <div class="border-t border-slate-100 mx-2 my-1"></div>

            <div class="px-2 py-1">
              <button class="light-drop-item w-full">Help</button>
              <button class="light-drop-item w-full">Shortcuts</button>
              <button @click="handleLogout" class="light-drop-item w-full">Log out</button>
            </div>
          </div>
        </Teleport>
      </div>
    </nav>

    <!-- Sub-header (Sticky) -->
    <header
      class="h-14 flex items-center justify-between px-4 shrink-0 bg-white/80 border-b border-slate-200/60 backdrop-blur-sm z-40 sticky top-12 text-slate-700"
    >
      <div class="flex items-center gap-3 relative">
        <h2 class="font-bold text-sm text-slate-800 tracking-tight select-none">
          Bactch Year Students
        </h2>
        <!-- Retro 2026 Flip Display from screenshot -->
        <div class="flex items-center gap-[3px] select-none" title="Current Academic Year 2026">
          <!-- Digit 2 -->
          <div class="flip-card-container">
            <div class="flip-card">
              <div class="flip-card-top"><span>2</span></div>
              <div class="flip-card-bottom"><span>2</span></div>
              <div class="flip-card-divider"></div>
              <div class="flip-card-hinge-left"></div>
              <div class="flip-card-hinge-right"></div>
            </div>
          </div>
          <!-- Digit 0 -->
          <div class="flip-card-container">
            <div class="flip-card">
              <div class="flip-card-top"><span>0</span></div>
              <div class="flip-card-bottom"><span>0</span></div>
              <div class="flip-card-divider"></div>
              <div class="flip-card-hinge-left"></div>
              <div class="flip-card-hinge-right"></div>
            </div>
          </div>
          <!-- Digit 2 -->
          <div class="flip-card-container">
            <div class="flip-card">
              <div class="flip-card-top"><span>2</span></div>
              <div class="flip-card-bottom"><span>2</span></div>
              <div class="flip-card-divider"></div>
              <div class="flip-card-hinge-left"></div>
              <div class="flip-card-hinge-right"></div>
            </div>
          </div>
          <!-- Digit 6 with active flip fold -->
          <div class="flip-card-container flipping">
            <div class="flip-card">
              <div class="flip-card-top"><span>6</span></div>
              <div class="flip-card-bottom"><span>6</span></div>
              <div class="flip-card-divider"></div>
              <div class="flip-card-hinge-left"></div>
              <div class="flip-card-hinge-right"></div>
              <!-- Tilted bottom flap mimicking screenshot's folding style -->
              <div class="flip-card-bottom-tilt"><span>6</span></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <div class="flex items-center -space-x-1 mx-1 relative">
          <div
            @click="isBoardMemberMenuOpen = !isBoardMemberMenuOpen"
            class="w-7 h-7 rounded-full bg-[#ff7452] flex items-center justify-center text-[10px] font-bold border-2 border-white relative group cursor-pointer text-white"
          >
            LS
            <div
              class="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white"
            >
              <IconSparkles class="w-2 h-2" />
            </div>

            <!-- Board Member Profile Dropdown -->
            <div
              v-if="isBoardMemberMenuOpen"
              class="absolute top-full right-0 mt-1 w-80 bg-white border border-slate-200 rounded-[8px] shadow-2xl z-[100] p-2 text-slate-700 text-left font-normal"
              @click.stop
            >
              <!-- Account Section -->
              <div class="px-1 py-1">
                <p class="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  Account
                </p>
                <div class="flex items-center gap-3 mb-2">
                  <div
                    class="w-10 h-10 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-lg text-white"
                  >
                    LS
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-sm font-bold text-slate-800 truncate">Le thean Seourn</p>
                    <p class="text-[11px] text-slate-505 truncate">letheanseourn05@gmail.com</p>
                  </div>
                </div>
                <button class="light-drop-item w-full">Switch accounts</button>
                <button class="light-drop-item w-full flex items-center justify-between">
                  Manage account
                  <IconExternalLink class="w-3.5 h-3.5 opacity-50" />
                </button>
              </div>

              <div class="border-t border-slate-100 mx-2 my-1"></div>

              <div class="px-1 py-1">
                <p class="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  Settings
                </p>
                <button class="light-drop-item w-full">Profile</button>
              </div>

              <div class="border-t border-slate-100 mx-2 my-1"></div>

              <div class="px-1 py-1">
                <button @click="handleLogout" class="light-drop-item w-full">Log out</button>
              </div>
            </div>
          </div>
          <button
            class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-[10px] font-bold border-2 border-transparent text-slate-600"
          >
            <IconPlus class="w-4 h-4" />
          </button>
        </div>

        <button class="p-2 hover:bg-slate-100 rounded-[5px] text-slate-500 hover:text-slate-700 transition-colors">
          <IconBolt class="w-5 h-5" />
        </button>

        <button class="p-2 hover:bg-slate-100 rounded-[5px] text-slate-500 hover:text-slate-700 transition-colors">
          <IconBulb class="w-5 h-5" />
        </button>
        <button class="p-2 hover:bg-slate-100 rounded-[5px] text-slate-500 hover:text-slate-700 transition-colors">
          <IconStar class="w-5 h-5" />
        </button>
        <button
          class="p-2 hover:bg-slate-100 rounded-[5px] text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1"
        >
          <IconUsers class="w-5 h-5" />
        </button>
        <div class="w-px h-6 bg-slate-200 mx-1"></div>
        <button
          class="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-[3px] text-xs transition-colors"
        >
          <IconUserPlus class="w-4 h-4" />
          Share
        </button>

        <button class="p-2 hover:bg-slate-100 rounded-[5px] text-slate-500 hover:text-slate-700 transition-colors">
          <IconDots class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Board Content (Vertical Page Scroll) -->
    <main class="flex-1 p-3 flex items-start gap-3 pb-32 overflow-auto no-scrollbar">
      <div
        v-for="list in filteredLists"
        :key="list.id"
        class="w-72 shrink-0 rounded-[5px] flex flex-col transition-all shadow-md h-fit border border-slate-200/60 bg-slate-100/90"
        @dragover.prevent
        @drop="onDrop($event, list.id)"
      >
        <div class="p-3 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-sm text-slate-800 flex items-center gap-2">
            <input
              v-if="editingListTitleId === list.id"
              v-model="editListTitleText"
              @blur="saveListTitle"
              @keyup.enter="saveListTitle"
              @keyup.esc="editingListTitleId = null"
              class="border border-indigo-400 bg-white rounded-[3px] px-1.5 py-0.5 outline-none text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 w-full max-w-[140px]"
              autofocus
            />
            <span v-else>{{ list.title }}</span>
          </h3>
          <div class="relative flex items-center gap-1.5 text-slate-400">
            <div
              class="w-5 h-5 rounded-[5px] flex items-center justify-center text-[10px] font-bold shrink-0"
              :class="list.title === 'To Do' || list.title === 'Open' ? 'bg-rose-100 text-rose-600' : list.title === 'In Progress' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'"
            >
              {{ list.cards.length }}
            </div>
            <button
              @click.stop="openListMenuId = openListMenuId === list.id ? null : list.id"
              class="p-0.5 rounded-[5px] hover:bg-slate-200 cursor-pointer transition-colors"
              :class="{ 'bg-slate-200 text-slate-600': openListMenuId === list.id }"
            >
              <IconDots class="w-4 h-4" />
            </button>

            <!-- List Dropdown Menu -->
            <div
              v-if="openListMenuId === list.id"
              class="fixed inset-0 z-[80]"
              @click.stop="openListMenuId = null"
            ></div>
            <div
              v-if="openListMenuId === list.id"
              class="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200/80 rounded-[8px] shadow-lg z-[90] p-1.5 text-left font-normal animate-in fade-in slide-in-from-top-1 duration-100"
              @click.stop
            >
              <button
                @click.stop="startEditListTitle(list)"
                class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1e293b] hover:bg-slate-50 rounded-[4px] transition-colors cursor-pointer"
              >
                <IconEdit class="w-4 h-4 text-slate-500" />
                Edit
              </button>
              <div class="h-px bg-slate-100 my-1"></div>
              <button
                @click.stop="openListMenuId = null"
                class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/60 rounded-[4px] transition-colors cursor-pointer"
              >
                <IconArchive class="w-4 h-4 text-red-500" />
                Archive
              </button>
            </div>
          </div>
        </div>

        <div class="px-2 pb-2 space-y-2">
          <!-- Card Component -->
          <div
            v-for="card in list.cards"
            :key="card.id"
            class="bg-white rounded-[5px] border border-slate-200/60 shadow-sm hover:shadow-md cursor-pointer transition-all relative group w-full text-left"
            draggable="true"
            @dragstart="onDragStart($event, card, list.id)"
            @click="openEditCardModal(card, list.id)"
          >
            <div class="px-3 py-2.5 space-y-2.5">
              <div class="flex items-start justify-between gap-2 pr-6">
                <div
                  class="flex items-center gap-2 min-w-0 hover:bg-slate-50 p-0.5 rounded transition-colors"
                  title="View Student Profile"
                  @click.stop="openStudentCardModal(card.student)"
                >
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold select-none uppercase shadow-inner border border-slate-200"
                  >
                    {{ card.student.charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-xs text-[#475569] hover:underline truncate">{{ card.student }}</p>
                    <p class="text-[9px] font-bold text-slate-400 truncate">{{ card.teacher }}</p>
                  </div>
                </div>
                <span
                  class="shrink-0 inline-flex items-center rounded-[3px] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider border"
                  :class="priorityClass(card.priority)"
                >
                  {{ card.priority }} Priority
                </span>
              </div>

              <div>
                <p class="text-[11px] font-bold text-[#0f172a] leading-snug">{{ card.subject }}</p>
                <p class="text-[10.5px] text-slate-600 font-medium mt-0.5 leading-relaxed line-clamp-2">
                  {{ card.description }}
                </p>
              </div>

              <div class="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wider border"
                    :class="typeClass(card.type)"
                  >
                    <IconBook class="h-3 w-3 opacity-80" />
                    {{ card.type }}
                  </span>
                </div>
                <span class="text-[9px] font-bold text-slate-400 shrink-0">{{ card.lastUpdate }}</span>
              </div>

              <!-- Card Menu Trigger -->
              <div class="absolute right-1.5 top-2">
                <button
                  @click.stop="openCardMenuId = openCardMenuId === card.id ? null : card.id"
                  class="p-1 rounded-[5px] hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all opacity-70 hover:opacity-100"
                  :class="{ 'opacity-100 bg-slate-100': openCardMenuId === card.id }"
                >
                  <IconDots class="w-3.5 h-3.5" />
                </button>

                <!-- Card Dropdown Menu -->
                <div
                  v-if="openCardMenuId === card.id"
                  class="fixed inset-0 z-[80]"
                  @click.stop="openCardMenuId = null"
                ></div>
                <div
                  v-if="openCardMenuId === card.id"
                  class="absolute top-full right-0 mt-1 w-40 bg-white border border-slate-200/80 rounded-[8px] shadow-lg z-[90] p-1.5 text-left font-normal animate-in fade-in slide-in-from-top-1 duration-100"
                  @click.stop
                >
                  <button
                    @click.stop="openEditCardModal(card, list.id)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1e293b] hover:bg-slate-50 rounded-[4px] transition-colors cursor-pointer"
                  >
                    <IconEdit class="w-4 h-4 text-slate-500" />
                    Edit
                  </button>
                  <div class="h-px bg-slate-100 my-1"></div>
                  <button
                    @click.stop="archiveCard(card.id, list.id)"
                    class="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50/60 rounded-[4px] transition-colors cursor-pointer"
                  >
                    <IconArchive class="w-4 h-4 text-red-500" />
                    Archive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List Footer (Add Card) -->
        <div class="p-2 shrink-0">
          <!-- Add Card Input Area -->
          <div v-if="addingCardToListId === list.id" class="space-y-2">
            <div class="bg-white rounded-[5px] border border-slate-300 p-2 shadow-sm">
              <textarea
                v-model="newCardTitle"
                placeholder="Enter student name..."
                class="w-full bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-none outline-none resize-none min-h-[50px]"
                @keydown.enter.prevent="addCard(list.id)"
                auto-focus
              ></textarea>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="addCard(list.id)"
                class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-[5px] text-xs transition-colors cursor-pointer"
              >
                Add card
              </button>
              <button
                @click="toggleAddCard(null)"
                class="p-1 rounded-[5px] text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <IconPlus class="w-5 h-5 rotate-45" />
              </button>
            </div>
          </div>

          <!-- Add Card Button (Trigger) -->
          <button
            v-else
            @click="toggleAddCard(list.id)"
            class="w-full flex items-center justify-between px-2 py-1.5 rounded-[5px] text-xs font-semibold text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <span class="flex items-center gap-2">
              <IconPlus class="w-4 h-4" />
              Add a card
            </span>
            <IconFolderPlus class="w-4 h-4 opacity-60" />
          </button>
        </div>
      </div>

      <!-- Add List Input Area -->
      <div v-if="isAddingList" class="w-72 shrink-0 bg-slate-100/90 border border-slate-200/60 rounded-[5px] p-3 h-fit space-y-2">
        <input
          v-model="newListTitle"
          type="text"
          placeholder="Enter list title..."
          class="w-full bg-white border border-slate-300 rounded-[5px] px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          @keydown.enter.prevent="addList"
          autofocus
        />
        <div class="flex items-center gap-2">
          <button
            @click="addList"
            class="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-[5px] text-xs transition-colors cursor-pointer"
          >
            Add list
          </button>
          <button
            @click="toggleAddList(false)"
            class="p-1 rounded-[5px] text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
          >
            <IconPlus class="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>

      <!-- Add List Button (Trigger) -->
      <button
        v-else
        @click="toggleAddList(true)"
        class="w-72 shrink-0 bg-slate-200/60 hover:bg-slate-200 border border-dashed border-slate-300 rounded-[5px] p-3 text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition-all h-fit cursor-pointer"
      >
        <IconPlus class="w-4 h-4" />
        Add another list
      </button>
    </main>

    <!-- Bottom Nav (Fixed Position) -->
    <div
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200/80 rounded-[8px] px-2 py-1.5 flex items-center gap-1 shadow-xl z-30 text-slate-600"
    >
      <button
        class="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-[5px] text-[13px] font-medium transition-colors"
      >
        <IconInbox class="w-4 h-4 text-slate-500" />
        Inbox
      </button>
      <button
        class="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-[5px] text-[13px] font-medium transition-colors"
      >
        <IconCalendarMonth class="w-4 h-4 text-slate-500" />
        Planner
      </button>
      <button
        class="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-[5px] text-[13px] font-bold transition-colors border border-slate-200/50"
      >
        <IconGridDots class="w-4 h-4 text-slate-700" />
        Board
      </button>
      <button
        class="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-[5px] text-[13px] font-medium transition-colors text-slate-500"
      >
        <IconGridDots class="w-4 h-4 rotate-90" />
        Switch boards
      </button>
    </div>

    <!-- Edit Card Modal (Mockup) -->
    <div v-if="isEditCardModalOpen" class="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div class="bg-[#161a1d] text-white rounded-lg shadow-2xl border border-[#30363d] max-w-4xl w-full animate-in fade-in zoom-in-95 duration-150 text-left overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Top header row (close button, etc.) -->
        <div class="flex items-center justify-between px-6 pt-4 pb-2 shrink-0">
          <div class="flex items-center gap-2 text-slate-400 text-xs">
            <IconLayoutBoard class="w-4 h-4 text-slate-500" />
            <span class="font-bold text-slate-400">Case Board</span>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <IconSparkles class="w-4 h-4" />
            </button>
            <button type="button" class="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <IconDots class="w-4 h-4" />
            </button>
            <button type="button" @click="isEditCardModalOpen = false" class="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <IconX class="w-5 h-5" />
            </button>
          </div>
        </div>

        <form @submit.prevent="saveCardEdit" class="flex flex-col flex-1 min-h-0">
          <!-- Double Column Content Area -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 px-6 pb-6 overflow-hidden flex-1 min-h-0">
            <!-- Left Column: Details & Description (Scrollable) -->
            <div class="md:col-span-7 space-y-6 overflow-y-auto pr-4 max-h-[70vh] custom-scrollbar">
              <!-- Main Title & Subtitle inside Left Column -->
              <div class="flex items-start gap-3 pt-2">
                <span class="w-5 h-5 rounded-full border-2 border-slate-400 mt-1.5 shrink-0 inline-block"></span>
                <div class="flex-1">
                  <input
                    v-model="editForm.subject"
                    type="text"
                    required
                    class="w-full bg-transparent border-0 text-xl font-bold text-white focus:bg-[#22272b] focus:ring-1 focus:ring-[#85b8ff] focus:outline-none rounded px-2 py-0.5 -ml-2 transition-all"
                    placeholder="Case Subject"
                  />
                  <p class="text-xs text-slate-400 mt-1 ml-0.5">
                    in list <span class="underline font-semibold text-slate-300 cursor-pointer">{{ editingListTitle }}</span>
                  </p>
                </div>
              </div>

              <!-- Action Row -->
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" class="flex items-center gap-1.5 px-3 py-1 bg-[#22272b] hover:bg-[#2c333a] rounded-[3px] text-xs font-bold text-slate-200 transition-colors border border-[#30363d] cursor-pointer">
                  <IconPlus class="w-3.5 h-3.5 text-slate-400" /> Add
                </button>
                <button type="button" class="flex items-center gap-1.5 px-3 py-1 bg-[#22272b] hover:bg-[#2c333a] rounded-[3px] text-xs font-bold text-slate-200 transition-colors border border-[#30363d] cursor-pointer">
                  <IconTags class="w-3.5 h-3.5 text-slate-400" /> Labels
                </button>
                <button type="button" class="flex items-center gap-1.5 px-3 py-1 bg-[#22272b] hover:bg-[#2c333a] rounded-[3px] text-xs font-bold text-slate-200 transition-colors border border-[#30363d] cursor-pointer">
                  <IconClock class="w-3.5 h-3.5 text-slate-400" /> Dates
                </button>
                <button type="button" class="flex items-center gap-1.5 px-3 py-1 bg-[#22272b] hover:bg-[#2c333a] rounded-[3px] text-xs font-bold text-slate-200 transition-colors border border-[#30363d] cursor-pointer">
                  <IconListCheck class="w-3.5 h-3.5 text-slate-400" /> Checklist
                </button>
              </div>

              <!-- Edit Fields Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Student Name</span>
                  <input
                    v-model="editForm.student"
                    type="text"
                    required
                    class="w-full rounded-[3px] border border-[#30363d] bg-[#22272b] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#85b8ff] transition-colors font-bold"
                    placeholder="Enter student name..."
                  />
                </div>
                <div>
                  <span class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Assigned Teacher</span>
                  <input
                    v-model="editForm.teacher"
                    type="text"
                    required
                    class="w-full rounded-[3px] border border-[#30363d] bg-[#22272b] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#85b8ff] transition-colors font-bold"
                    placeholder="Enter teacher name..."
                  />
                </div>
                <div>
                  <span class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Priority</span>
                  <BaseDropdown
                    v-model="editForm.priority"
                    :options="priorityOptions"
                    :shadow="false"
                    :full-width="true"
                    :dark="true"
                  />
                </div>
                <div>
                  <span class="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Type</span>
                  <BaseDropdown
                    v-model="editForm.type"
                    :options="typeOptions"
                    :shadow="false"
                    :full-width="true"
                    :dark="true"
                  />
                </div>
              </div>

              <!-- Description editor -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <IconAlignLeft class="w-4 h-4 text-slate-400" />
                  <h3 class="text-xs font-bold text-slate-350 uppercase tracking-wider">Description</h3>
                </div>
                <RichTextEditor v-model="editForm.description" placeholder="Use formatting shortcuts above to write description..." />
                <div class="flex items-center justify-between mt-2.5">
                  <div class="flex items-center gap-2">
                    <button type="submit" class="bg-[#579dff] text-[#161a1d] hover:bg-[#85b8ff] px-3 py-1.5 text-xs font-bold rounded-[3px] transition-colors cursor-pointer">Save</button>
                    <button type="button" @click="isEditCardModalOpen = false" class="hover:bg-white/10 text-slate-300 px-3 py-1.5 text-xs font-bold rounded-[3px] transition-colors cursor-pointer border border-transparent">Cancel</button>
                  </div>
                  <button type="button" class="text-slate-400 hover:text-white text-xs font-bold hover:bg-[#22272b] px-3 py-1.5 rounded-[3px] transition-colors border border-[#30363d]/50 cursor-pointer">Formatting help</button>
                </div>
              </div>
            </div>

            <!-- Right Column: Comments & Activities (Scrollable) -->
            <div class="md:col-span-5 space-y-6 md:pl-2 overflow-y-auto pr-2 max-h-[70vh] custom-scrollbar">
              <!-- Heading aligned horizontally with Title -->
              <div class="flex items-center justify-between pt-2">
                <div class="flex items-center gap-2">
                  <IconMessage class="w-4 h-4 text-slate-400" />
                  <h3 class="text-xs font-bold text-slate-355 uppercase tracking-wider">Comments and activity</h3>
                </div>
                <button type="button" class="bg-[#22272b] hover:bg-[#2c333a] border border-[#30363d] text-slate-355 hover:text-white font-bold px-2.5 py-1 text-[11px] rounded-[3px] transition-colors cursor-pointer">
                  Show details
                </button>
              </div>

              <!-- Comment writer -->
              <div>
                <RichTextEditor v-model="newCommentText" placeholder="Write a comment..." :min-height="'80px'" :max-height="'200px'" />
                <div class="flex items-center gap-4 mt-3">
                  <button type="button" @click="addComment" :disabled="!newCommentText.trim()" class="px-3 py-1.5 text-xs font-bold rounded-[3px] transition-colors cursor-pointer" :class="newCommentText.trim() ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-[#22272b] text-slate-500 border border-[#30363d] cursor-not-allowed'">Save</button>
                  <label class="flex items-center gap-2 text-xs text-slate-300 font-bold cursor-pointer select-none">
                    <input type="checkbox" v-model="isWatching" class="rounded-[3px] bg-[#22272b] border-[#30363d] text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer" />
                    <IconEye class="w-3.5 h-3.5 text-slate-400" />
                    Watch
                  </label>
                </div>
              </div>

              <!-- Activity List -->
              <div class="space-y-4 pr-1">
                <div v-for="act in caseActivities" :key="act.id" class="flex gap-3 text-xs">
                  <!-- Avatar -->
                  <div class="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 border border-[#30363d]">
                    {{ act.user.split(' ').map(n => n[0]).join('') }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-slate-200">
                      <span class="font-bold text-white hover:underline cursor-pointer mr-1">{{ act.user }}</span>
                      <span v-html="act.text"></span>
                    </p>
                    <span class="text-[10px] text-slate-400 mt-1 block hover:underline cursor-pointer">
                      {{ act.time }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Row -->
          <div class="border-t border-[#30363d] px-6 py-4 bg-[#1d2125]/60 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              @click="isEditCardModalOpen = false"
              class="rounded-[3px] border border-[#30363d] bg-transparent hover:bg-white/5 text-slate-300 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-[3px] bg-[#579dff] text-[#161a1d] px-4 py-2 text-xs font-bold hover:bg-[#85b8ff] transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
 
    <!-- Edit Student Card Modal (Mockup) -->
    <div v-if="isStudentCardModalOpen" class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left text-slate-800">
        <!-- Student Header Card Design -->
        <div class="bg-[#311B73] p-6 text-white relative">
          <button @click="isStudentCardModalOpen = false" class="absolute right-4 top-4 text-white/85 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10">
            <IconX class="w-5 h-5" />
          </button>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-white text-[#311B73] flex items-center justify-center text-2xl font-black uppercase border-2 border-white/20 shadow-md shrink-0">
              {{ editingStudentForm.name.charAt(0) || '?' }}
            </div>
            <div class="min-w-0">
              <h2 class="text-lg font-bold truncate leading-tight">{{ editingStudentForm.name || 'New Student' }}</h2>
              <p class="text-xs text-purple-200 mt-0.5 font-medium">{{ editingStudentForm.class }} • PNC Batch 2025</p>
              <div class="flex items-center gap-1.5 mt-2">
                <span class="rounded-[3px] bg-white/20 text-white px-2 py-0.5 text-[10px] font-bold tracking-wider">
                  {{ editingStudentForm.studentCode }}
                </span>
                <span class="rounded-[3px] px-2 py-0.5 text-[10px] font-bold" :class="statusBadgeClass(editingStudentForm.status)">
                  {{ editingStudentForm.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
 
        <form @submit.prevent="saveStudentCardEdit" class="p-5 space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Full Name</label>
            <div class="relative">
              <input
                v-model="editingStudentForm.name"
                type="text"
                required
                class="w-full rounded-[5px] border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-indigo-300 bg-white transition-colors"
                placeholder="Enter student name..."
              />
              <IconUser class="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
 
          <!-- Code & Class -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Student ID</label>
              <input
                v-model="editingStudentForm.studentCode"
                type="text"
                required
                class="w-full rounded-[5px] border border-slate-200 px-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-indigo-300 bg-white transition-colors"
                placeholder="PNC2025-001"
              />
            </div>
            <div>
              <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Class</label>
              <BaseDropdown
                v-model="editingStudentForm.class"
                :options="classOptions"
                :shadow="false"
                :full-width="true"
              />
            </div>
          </div>
 
          <!-- Gender & Status -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Gender</label>
              <BaseDropdown
                v-model="editingStudentForm.gender"
                :options="genderOptions"
                :shadow="false"
                :full-width="true"
              />
            </div>
            <div>
              <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Status</label>
              <BaseDropdown
                v-model="editingStudentForm.status"
                :options="statusOptions"
                :shadow="false"
                :full-width="true"
              />
            </div>
          </div>
 
          <!-- Email -->
          <div>
            <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Email Address</label>
            <div class="relative">
              <input
                v-model="editingStudentForm.email"
                type="email"
                required
                class="w-full rounded-[5px] border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-[#0f172a] placeholder-slate-400 focus:outline-none focus:border-indigo-300 bg-white transition-colors"
                placeholder="name@student.passerellesnumeriques.org"
              />
              <IconMail class="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
 
          <!-- Phone & POB -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Phone Number</label>
              <div class="relative">
                <input
                  v-model="editingStudentForm.phone"
                  type="text"
                  required
                  class="w-full rounded-[5px] border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-indigo-300 bg-white transition-colors"
                  placeholder="+855..."
                />
                <IconPhone class="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div>
              <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Place of Birth</label>
              <div class="relative">
                <input
                  v-model="editingStudentForm.placeOfBirth"
                  type="text"
                  required
                  class="w-full rounded-[5px] border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-indigo-300 bg-white transition-colors"
                  placeholder="Province name..."
                />
                <IconMapPin class="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
 
          <!-- Key Recognition / Award -->
          <div>
            <label class="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Key Recognition / Award</label>
            <div class="relative">
              <input
                v-model="editingStudentForm.award"
                type="text"
                class="w-full rounded-[5px] border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-[#0f172a] focus:outline-none focus:border-indigo-300 bg-white transition-colors"
                placeholder="e.g. Student of the Year..."
              />
              <IconAward class="w-4 h-4 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
 
          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
            <button
              type="button"
              @click="isStudentCardModalOpen = false"
              class="rounded-[3px] bg-white text-slate-500 border border-slate-200 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-[3px] bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom small clean scrollbar for the modal columns */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #579dff;
}

/* ---------------------------------------------------- */
/* Retro 2026 Flip Digit Styles                         */
/* ---------------------------------------------------- */
.flip-card-container {
  display: inline-block;
  perspective: 300px;
}
.flip-card {
  position: relative;
  width: 28px;
  height: 40px;
  background-color: #27442f;
  background-image: radial-gradient(circle at center, #2e4f37, #1f3726);
  border-radius: 4px;
  border: 1.5px solid #122318;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  font-family: 'Exo 2', sans-serif;
  font-weight: 800;
  font-size: 26px;
  line-height: 40px;
  text-align: center;
  color: #FAF9F3;
  overflow: hidden;
}
.flip-card-top, .flip-card-bottom {
  position: absolute;
  left: 0;
  width: 100%;
  height: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
}
.flip-card-top {
  top: 0;
  align-items: flex-end;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.4);
}
.flip-card-top::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
}
.flip-card-bottom {
  bottom: 0;
  align-items: flex-start;
  border-top: 0.5px solid rgba(255, 255, 255, 0.05);
}
.flip-card-divider {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.45);
  box-shadow: 0 0.5px 0 rgba(255, 255, 255, 0.1);
  z-index: 10;
}
.flip-card-hinge-left, .flip-card-hinge-right {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 4px;
  background-color: #FAF9F3;
  z-index: 15;
  border-radius: 1px;
  opacity: 0.7;
}
.flip-card-hinge-left {
  left: 0;
}
.flip-card-hinge-right {
  right: 0;
}
.flip-card-bottom-tilt {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background-color: #1f3726;
  background-image: linear-gradient(to bottom, #243e2b, #192d1f);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  border-top: 0.5px solid rgba(255, 255, 255, 0.05);
  transform-origin: top center;
  transform: rotateX(-32deg);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.45);
  z-index: 8;
  filter: brightness(0.92);
}
.flip-card-top span, .flip-card-bottom span, .flip-card-bottom-tilt span {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}
.flip-card-top span {
  bottom: -20px;
}
.flip-card-bottom span {
  top: -20px;
}
.flip-card-bottom-tilt span {
  top: -20px;
}

@keyframes flap-wiggle {
  0%, 100% { transform: rotateX(-32deg); }
  50% { transform: rotateX(-12deg); }
}
.flip-card-container.flipping:hover .flip-card-bottom-tilt {
  animation: flap-wiggle 0.6s ease-in-out infinite;
  filter: brightness(1.0);
}
</style>

<style>
.rich-editor:empty:before {
  content: attr(placeholder);
  color: #555c65;
  pointer-events: none;
  display: block;
}

.rich-editor h1,
.rich-editor h2,
.rich-editor p,
.rich-editor ul,
.rich-editor ol {
  margin-top: 2px !important;
  margin-bottom: 2px !important;
}
.rich-editor h1 {
  font-size: 1.2rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
}
.rich-editor h2 {
  font-size: 1.05rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
}
.rich-editor h3 {
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
}
.rich-editor h4 {
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
}
.rich-editor h5 {
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
}
.rich-editor h6 {
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
}
.rich-editor ul {
  padding-left: 1.25rem !important;
  list-style-type: disc !important;
}
.rich-editor ol {
  padding-left: 1.25rem !important;
  list-style-type: decimal !important;
}
.rich-editor li {
  margin-top: 1px !important;
  margin-bottom: 1px !important;
}
.rich-editor a {
  color: #579dff !important;
  text-decoration: underline !important;
}
.rich-editor img {
  height: 20px !important;
  width: auto !important;
  border-radius: 2px !important;
  vertical-align: middle !important;
  display: inline !important;
  margin: 0 2px !important;
}

.rich-editor {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.rich-editor::-webkit-scrollbar {
  display: none;
}
</style>
