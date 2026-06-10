<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logoSrc from '@/assets/images/logo1.png'
import {
  IconSearch,
  IconBell,
  IconHelpCircle,
  IconLayoutBoard,
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
  IconPlus,
  IconFolderPlus,
  IconBolt,
  IconBulb,
  IconStar,
  IconUsers,
  IconUserPlus,
  IconDots,
  IconArrowsMove,
  IconCheck,
  IconArrowsMaximize,
  IconArchive,
  IconEdit,
  IconInbox,
  IconCalendarMonth,
  IconGridDots,
  IconSparkles,
  IconTable,
  IconTimeline,
  IconMap,
  IconChartBar,
  IconX,
} from '@tabler/icons-vue'

const auth = useAuthStore()
const router = useRouter()

const avatarRef = ref<HTMLElement | null>(null)
const isProfileMenuOpen = ref(false)
const isBoardTitleMenuOpen = ref(false)

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
const addingCardToListId = ref<number | null>(null)
const newCardTitle = ref('')

const onDragStart = (e: DragEvent, card: Card, fromListId: number) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData('cardId', card.id.toString())
    e.dataTransfer.setData('fromListId', fromListId.toString())
    e.dataTransfer.effectAllowed = 'move'
  }
}

const onDrop = (e: DragEvent, toListId: number) => {
  const cardId = parseInt(e.dataTransfer?.getData('cardId') || '0')
  const fromListId = parseInt(e.dataTransfer?.getData('fromListId') || '0')

  if (fromListId === toListId) return

  const fromList = lists.value.find(l => l.id === fromListId)
  const toList = lists.value.find(l => l.id === toListId)

  if (fromList && toList) {
    const cardIndex = fromList.cards.findIndex(c => c.id === cardId)
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
  const list = lists.value.find(l => l.id === listId)
  if (list) {
    list.cards.push({
      id: Date.now(),
      title: newCardTitle.value.trim(),
    })
    newCardTitle.value = ''
    addingCardToListId.value = null
  }
}

interface Card {
  id: number
  title: string
  image?: string
  icons?: string[]
  completed?: boolean
  number?: number
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
    title: 'Trello Starter Guide',
    color: 'bg-[#2d1b36]/80',
    cards: [
      {
        id: 1,
        title: 'New to Trello? Start here',
        image: 'https://i.pinimg.com/736x/fc/d5/c9/fcd5c9a91c66cc1d41df74c218363379.jpg',
        icons: ['loom', 'expand'],
      },
      {
        id: 2,
        title: 'Capture from email, Slack, and Teams',
        image: 'https://i.pinimg.com/1200x/d6/7b/a9/d67ba90488db292eb8f1e7e9a114cfe9.jpg',
      },
    ],
  },
  {
    id: 2,
    title: 'Today',
    color: 'bg-[#5e4f1a]/80',
    cards: [
      { id: 3, title: 'Start using Trello', completed: true },
    ],
  },
  {
    id: 3,
    title: 'This Week',
    color: 'bg-[#1b3d2c]/80',
    cards: [],
  },
  {
    id: 4,
    title: 'Later',
    color: 'bg-[#1a1a1a]/80',
    cards: [],
  },
])

const searchQuery = ref('')
const filteredLists = computed(() => {
  if (!searchQuery.value.trim()) {
    return lists.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return lists.value.map(list => {
    return {
      ...list,
      cards: list.cards.filter(card => card.title.toLowerCase().includes(query))
    }
  })
})

const handleLogout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-gradient-to-br from-[#512da8] via-[#8e24aa] to-[#c2185b] text-white font-sans relative no-scrollbar">
    <!-- Top Navbar (Sticky) -->

    <nav class="h-12 bg-[#1d2125] flex items-center justify-between px-4 shrink-0 border-b border-white/10 z-50 sticky top-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <img :src="logoSrc" class="h-7" alt="Logo" />
          <span class="text-sm font-medium opacity-80">Student Performance Tracking System</span>
        </div>
        <div class="relative w-[240px] hidden md:block">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search cards..." 
            class="w-full bg-white/10 border border-white/20 rounded-[5px] py-1.5 pl-8 pr-3 text-xs focus:outline-none transition-all"
          >
          <IconSearch class="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <button class="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-semibold px-3 py-1 rounded-[5px] text-sm transition-colors">
          Create
        </button>
      </div>

      <div class="flex items-center gap-3">
        <router-link to="/admin" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-1 rounded-[5px] text-sm transition-colors">
          Admin
        </router-link>
        <div class="bg-[#d6bbfa] text-[#55107e] text-[11px] font-bold px-2 py-1 rounded-[5px] flex items-center gap-1">
          <IconSparkles class="w-3.5 h-3.5" />
           9 days left
        </div>
        <button class="opacity-70 hover:opacity-100 transition-opacity p-1.5"><IconBell class="w-5 h-5" /></button>
        <button class="opacity-70 hover:opacity-100 transition-opacity p-1.5"><IconHelpCircle class="w-5 h-5" /></button>
        <div 
          ref="avatarRef"
          @click="isProfileMenuOpen = !isProfileMenuOpen"
          class="w-8 h-8 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-sm text-white cursor-pointer hover:brightness-110 transition-all border-2 border-[#1d2125]"
        >
          LS
        </div>

        <Teleport to="body">
          <div 
            v-if="isProfileMenuOpen" 
            class="fixed inset-0 z-40"
            @click="isProfileMenuOpen = false"
          ></div>
          <div 
            v-if="isProfileMenuOpen" 
            class="fixed z-50 w-80 bg-[#1e1b4b] border border-white/10 rounded-[5px] shadow-2xl p-2 text-[#b6c2cf]"
            :style="dropdownStyle"
            @click.stop
          >
            <div class="px-2 py-1">
              <p class="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-wider px-1">Account</p>
              <div class="flex items-center gap-3 mb-2 px-1">
                <div class="w-10 h-10 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-lg text-white shrink-0">LS</div>
                <div class="overflow-hidden">
                  <p class="text-sm font-medium text-white truncate">Le thean Seourn</p>
                  <p class="text-[11px] text-white/40 truncate">letheanseourn05@gmail.com</p>
                </div>
              </div>
              <button class="dark-drop-item w-full">Switch accounts</button>
              <button class="dark-drop-item w-full flex items-center justify-between">
                Manage account <IconExternalLink class="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>

            <div class="border-t border-white/10 mx-2 my-1"></div>

            <div class="px-2 py-1">
              <p class="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider px-1">Trello</p>
              <button class="dark-drop-item w-full">Profile and visibility</button>
              <button class="dark-drop-item w-full">Activity</button>
              <button class="dark-drop-item w-full">Cards</button>
              <button class="dark-drop-item w-full">Settings</button>
              <button class="dark-drop-item w-full flex items-center justify-between">
                Labs <span class="bg-gradient-to-r from-purple-500 to-orange-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] flex items-center gap-1"><IconSparkles class="w-3 h-3" />Labs</span>
              </button>
              <button class="dark-drop-item w-full flex items-center justify-between">
                Theme <IconChevronRight class="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>

            <div class="border-t border-white/10 mx-2 my-1"></div>

            <div class="px-2 py-1">
              <button class="dark-drop-item w-full flex items-center gap-2"><IconUsers class="w-4 h-4" />Create Workspace</button>
            </div>

            <div class="border-t border-white/10 mx-2 my-1"></div>

            <div class="px-2 py-1">
              <button class="dark-drop-item w-full">Help</button>
              <button class="dark-drop-item w-full">Shortcuts</button>
              <button @click="handleLogout" class="dark-drop-item w-full">Log out</button>
            </div>
          </div>
        </Teleport>
      </div>
    </nav>

    <!-- Sub-header (Sticky) -->
    <header class="h-14 flex items-center justify-between px-4 shrink-0 bg-black/10 backdrop-blur-sm z-40 sticky top-12">
      <div class="flex items-center gap-2 relative">
        <button
          @click="isBoardTitleMenuOpen = !isBoardTitleMenuOpen"
          class="flex items-center gap-2 font-bold text-lg px-2 py-1 hover:bg-white/10 rounded-[5px] transition-colors"
        >
          Student Performance Board
          <IconLayoutBoard class="w-4 h-4 text-[#579dff]" />
          <IconChevronDown class="w-4 h-4 opacity-60" />
        </button>
        <div v-if="isBoardTitleMenuOpen" class="fixed inset-0 z-[60]" @click="isBoardTitleMenuOpen = false"></div>
        <div
          v-if="isBoardTitleMenuOpen"
          class="absolute top-full right-0 mt-2 w-72 bg-[#1e1b4b] border border-white/10 rounded-[5px] shadow-2xl z-[70] p-2"
          @click.stop
        >
          <div class="text-center py-2 relative">
            <h3 class="text-sm font-semibold text-white/70">Views</h3>
            <button 
              @click="isBoardTitleMenuOpen = false"
              class="absolute right-2 top-2 text-white/40 hover:text-white transition-colors"
            >
              <IconX class="w-4 h-4" />
            </button>
          </div>

          <div class="bg-gradient-to-br from-[#2d1b36] to-[#1d2125] border border-purple-500/30 rounded-[5px] p-2 mx-1 mb-2">
            <span class="text-[10px] font-bold text-purple-400 uppercase tracking-wider bg-purple-500/10 px-1.5 py-0.5 rounded-[5px] border border-purple-500/20">Premium</span>
            <p class="text-sm font-bold text-white mt-1.5">See your work in a new way</p>
            <p class="text-[11px] text-white/40 mt-0.5">Views are only available to Premium Workspaces.</p>
          </div>

          <button class="dark-drop-item w-full">
            <IconLayoutBoard class="w-4 h-4" />
            Board
          </button>
          <button class="dark-drop-item w-full">
            <IconTable class="w-4 h-4" />
            Table
          </button>
          <button class="dark-drop-item w-full">
            <IconCalendarMonth class="w-4 h-4" />
            Calendar
          </button>
          <button class="dark-drop-item w-full">
            <IconChartBar class="w-4 h-4" />
            Dashboard
          </button>
          <button class="dark-drop-item w-full">
            <IconTimeline class="w-4 h-4" />
            Timeline
          </button>
          <button class="dark-drop-item w-full">
            <IconMap class="w-4 h-4" />
            Map
          </button>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <div class="flex items-center -space-x-1 mx-1 relative">
          <div 
            @click="isBoardMemberMenuOpen = !isBoardMemberMenuOpen"
            class="w-7 h-7 rounded-full bg-[#ff7452] flex items-center justify-center text-[10px] font-bold border-2 border-[#6e39a0] relative group cursor-pointer"
          >
            LS
            <div class="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5 border border-white">
              <IconSparkles class="w-2 h-2" />
            </div>

            <!-- Board Member Profile Dropdown -->
            <div 
              v-if="isBoardMemberMenuOpen" 
              class="absolute top-full right-0 mt-1 w-80 bg-[#1e1b4b] border border-white/10 rounded-[5px] shadow-2xl z-[100] p-2 text-[#b6c2cf] text-left"
              @click.stop
            >
              <!-- Account Section -->
              <div class="px-1 py-1">
                <p class="text-[10px] font-bold text-white/40 mb-2 uppercase tracking-wider">Account</p>
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 rounded-full bg-[#ff7452] flex items-center justify-center font-bold text-lg text-white">LS</div>
                  <div class="overflow-hidden">
                    <p class="text-sm font-medium text-white truncate">Le thean Seourn</p>
                    <p class="text-[11px] text-white/40 truncate">letheanseourn05@gmail.com</p>
                  </div>
                </div>
                <button class="dark-drop-item w-full">Switch accounts</button>
                <button class="dark-drop-item w-full flex items-center justify-between">
                  Manage account
                  <IconExternalLink class="w-3.5 h-3.5 opacity-50" />
                </button>
              </div>

              <div class="border-t border-white/10 mx-2 my-1"></div>

              <!-- Trello Section -->
              <div class="px-1 py-1">
                <p class="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-wider">Trello</p>
                <button class="dark-drop-item w-full">Profile and visibility</button>
                <button class="dark-drop-item w-full">Activity</button>
                <button class="dark-drop-item w-full flex items-center justify-between">
                  Theme
                  <IconChevronRight class="w-3.5 h-3.5 opacity-50" />
                </button>
              </div>

              <div class="border-t border-white/10 mx-2 my-1"></div>

              <div class="px-1 py-1">
                <button @click="handleLogout" class="dark-drop-item w-full">Log out</button>
              </div>
            </div>
          </div>
          <button class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-[10px] font-bold border-2 border-transparent">
            <IconPlus class="w-4 h-4" />
          </button>
        </div>

        <button class="p-2 hover:bg-white/20 rounded-[5px] transition-colors opacity-80"><IconBolt class="w-5 h-5" /></button>

        <button class="p-2 hover:bg-white/20 rounded-[5px] transition-colors opacity-80"><IconBulb class="w-5 h-5" /></button>
        <button class="p-2 hover:bg-white/20 rounded-[5px] transition-colors opacity-80">
          <IconStar class="w-5 h-5" />
        </button>
        <button class="p-2 hover:bg-white/20 rounded-[5px] transition-colors opacity-80 flex items-center gap-1">
          <IconUsers class="w-5 h-5" />
        </button>
        <div class="w-px h-6 bg-white/20 mx-1"></div>
        <button class="flex items-center gap-2 px-3 py-1.5 bg-[#dfe1e6] hover:bg-[#ebecf0] text-[#172b4d] font-semibold rounded-[5px] text-sm transition-colors">
          <IconUserPlus class="w-4 h-4" />
          Share
        </button>

        <button class="p-2 hover:bg-white/20 rounded-[5px] transition-colors opacity-80">
          <IconDots class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Board Content (Vertical Page Scroll) -->
    <main class="flex-1 p-3 flex items-start gap-3 pb-32 overflow-auto no-scrollbar">
      <div 
        v-for="list in filteredLists" 
        :key="list.id" 
        class="w-72 shrink-0 rounded-[5px] flex flex-col transition-all shadow-lg h-fit"
        :class="list.color"
        @dragover.prevent
        @drop="onDrop($event, list.id)"
      >
        <div class="p-3 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-sm flex items-center gap-2">
            {{ list.title }}
          </h3>
          <div class="flex items-center gap-1 opacity-60">
            <IconArrowsMove class="w-4 h-4 hover:bg-white/10 rounded-[5px] cursor-pointer" />
            <IconDots class="w-4 h-4 hover:bg-white/10 rounded-[5px] cursor-pointer" />
          </div>
        </div>

        <div class="px-2 pb-2 space-y-2">
          <div 
            v-for="card in list.cards" 
            :key="card.id" 
            class="bg-[#1d2125] rounded-[5px] shadow-sm hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all relative group w-full"
            draggable="true"
            @dragstart="onDragStart($event, card, list.id)"
          >
            <!-- Card Image (At Top) with Overlays -->
            <div v-if="card.image" class="relative overflow-hidden rounded-t-[5px]">
              <img :src="card.image" class="w-full h-40 object-cover" alt="Card cover">

              <!-- Numbering Circle -->
              <div v-if="card.number" class="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#0c66e4] flex items-center justify-center font-bold text-lg text-white shadow-lg">
                {{ card.number }}
              </div>
            </div>

            <!-- Card Content -->
            <div class="p-3 space-y-2 relative">
              <div class="flex items-start gap-2">
                <div v-if="card.completed" class="w-5 h-5 rounded-full bg-[#4bce97] flex items-center justify-center shrink-0 mt-0.5">
                  <IconCheck class="w-3 h-3 text-[#1d2125]" />
                </div>
                <p class="text-[13px] font-medium leading-relaxed text-white/90 pr-6">{{ card.title }}</p>
                
                <!-- Card Menu Trigger -->
                <div class="absolute right-2 top-2.5">
                  <button 
                    @click.stop="openCardMenuId = openCardMenuId === card.id ? null : card.id"
                    class="p-1 rounded-[5px] hover:bg-white/10 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    :class="{ 'opacity-100 bg-white/10': openCardMenuId === card.id }"
                  >
                    <IconDots class="w-4 h-4" />
                  </button>

                  <!-- Card Dropdown Menu -->
                  <div v-if="openCardMenuId === card.id" class="fixed inset-0 z-[80]" @click.stop="openCardMenuId = null"></div>
                  <div
                    v-if="openCardMenuId === card.id"
                    class="absolute top-full right-0 mt-1 w-44 bg-[#1e1b4b] border border-white/10 rounded-[5px] shadow-2xl z-[90] p-1.5"
                    @click.stop
                  >
                    <button class="dark-drop-item w-full gap-2">
                      <IconEdit class="w-3.5 h-3.5" /> Edit card
                    </button>
                    <div class="h-px bg-white/10 my-1 mx-1"></div>
                    <button class="dark-drop-item w-full gap-2 text-red-400 hover:text-red-300">
                      <IconArchive class="w-3.5 h-3.5" /> Archive
                    </button>
                  </div>
                </div>
              </div>
              
              <div v-if="card.icons" class="flex items-center justify-between mt-1 pt-2 border-t border-white/5 opacity-60">
                <div class="flex items-center gap-3">
                  <div v-if="card.icons.includes('loom')" class="flex items-center gap-1">
                    <IconSparkles class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" />
                    <span class="text-[10px] font-bold uppercase tracking-wider">Loom</span>
                  </div>
                </div>
                <IconArrowsMaximize v-if="card.icons.includes('expand')" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <!-- List Footer (Add Card) -->
        <div class="p-2 shrink-0">
          <!-- Add Card Input Area -->
          <div v-if="addingCardToListId === list.id" class="space-y-2">
            <div class="bg-[#22272b] rounded-[5px] border-2 border-[#85b8ff] p-2 shadow-sm">
              <textarea
                v-model="newCardTitle"
                placeholder="Enter a title or paste a link"
                class="w-full bg-transparent border-none text-sm text-white placeholder-[#8c9bab] focus:ring-0 focus:outline-none outline-none resize-none min-h-[64px]"
                @keydown.enter.prevent="addCard(list.id)"
                auto-focus
              ></textarea>
              <div class="flex justify-end">
                 <div class="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                @click="addCard(list.id)"
                class="bg-[#579dff] text-[#1d2125] font-semibold px-3 py-1.5 rounded-[5px] text-sm"
              >
                Add card
              </button>
              <button class="bg-[#2d1b36] text-[#b6c2cf] font-semibold px-3 py-1.5 rounded-[5px] text-sm flex items-center gap-1">
                <IconBulb class="w-4 h-4" />
                Tip
              </button>
              <button 
                @click="toggleAddCard(null)"
                class="p-1.5 rounded-[5px] text-[#9fadbc] hover:text-white cursor-pointer transition-colors"
              >
                <IconPlus class="w-5 h-5 rotate-45" />
              </button>
            </div>
          </div>

          <!-- Add Card Button (Trigger) -->
          <button 
            v-else
            @click="toggleAddCard(list.id)"
            class="w-full flex items-center justify-between px-2 py-1.5 rounded-[5px] text-sm font-medium"
          >
            <span class="flex items-center gap-2">
              <IconPlus class="w-4 h-4" />
              Add a card
            </span>
            <IconFolderPlus class="w-4 h-4 opacity-60" />
          </button>
        </div>
      </div>

      <button class="w-72 shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-[5px] p-3 text-sm font-bold flex items-center gap-2 transition-all h-fit">
        <IconPlus class="w-5 h-5" />
        Add another list
      </button>
    </main>

    <!-- Bottom Nav (Fixed Position) -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1d2125] border border-white/10 rounded-[5px] px-2 py-1.5 flex items-center gap-1 shadow-2xl z-30">
      <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-[5px] text-[13px] font-medium transition-colors">
        <IconInbox class="w-4 h-4" />
        Inbox
      </button>
      <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-[5px] text-[13px] font-medium transition-colors">
        <IconCalendarMonth class="w-4 h-4" />
        Planner
      </button>
      <button class="flex items-center gap-2 px-3 py-1.5 bg-[#1c2b41] text-[#579dff] rounded-[5px] text-[13px] font-bold transition-colors">
        <IconGridDots class="w-4 h-4" />
        Board
      </button>
      <button class="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-[5px] text-[13px] font-medium transition-colors text-white/60">
        <IconGridDots class="w-4 h-4 rotate-90" />
        Switch boards
      </button>
    </div>
  </div>
</template>

