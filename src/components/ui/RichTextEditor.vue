<script setup lang="ts">
import { ref } from 'vue'
import { IconChevronDown, IconList, IconLink, IconPhoto, IconPaperclip } from '@tabler/icons-vue'

defineProps<{
  modelValue: string
  placeholder?: string
  minHeight?: string
  maxHeight?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editorRef = ref<HTMLElement | null>(null)
const isHeadingDropdownOpen = ref(false)
const headingLevels = [1, 2, 3, 4, 5, 6] as const
const imageInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function format(command: string, value: string = '') {
  if (editorRef.value) {
    editorRef.value.focus()
    document.execCommand(command, false, value)
    onInput()
  }
}

function onInput() {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

function promptForLink() {
  const url = prompt('Enter link URL:')
  if (url && editorRef.value) {
    editorRef.value.focus()
    document.execCommand('createLink', false, url)
    onInput()
  }
}

function triggerImageUpload() {
  imageInput.value?.click()
}

function handleImageSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const imgHtml = `<img src="${reader.result as string}" style="height:20px;width:auto;vertical-align:middle;display:inline;margin:0 2px" />`
    if (editorRef.value) {
      editorRef.value.focus()
      document.execCommand('insertHTML', false, imgHtml)
      onInput()
    }
  }
  reader.readAsDataURL(file)
  target.value = ''
}

function triggerFileUpload() {
  fileInput.value?.click()
}

function handleFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const fakeUrl = URL.createObjectURL(file)
  const fileHtml = `<a href="${fakeUrl}" target="_blank" download="${file.name}">📎 ${file.name}</a>`
  if (editorRef.value) {
    editorRef.value.focus()
    document.execCommand('insertHTML', false, fileHtml)
    onInput()
  }
  target.value = ''
}
</script>

<template>
  <div class="border border-[#30363d] rounded-[3px] bg-[#22272b] focus-within:ring-1 focus-within:ring-[#85b8ff] focus-within:border-[#85b8ff] transition-all overflow-hidden">
    <input type="file" ref="imageInput" accept="image/*" @change="handleImageSelected" class="hidden" />
    <input type="file" ref="fileInput" @change="handleFileSelected" class="hidden" />

    <div class="flex items-center justify-between px-3 py-2 border-b border-[#30363d] text-slate-400 text-xs select-none bg-[#1d2125]/85">
      <div class="flex items-center gap-1.5 flex-wrap">
        <div class="relative">
          <button type="button" @mousedown.prevent="isHeadingDropdownOpen = !isHeadingDropdownOpen" class="hover:text-white cursor-pointer font-semibold flex items-center gap-0.5">
            Tt <IconChevronDown class="w-3 h-3" />
          </button>
          <div v-if="isHeadingDropdownOpen" class="absolute left-0 mt-1 bg-[#22272b] border border-[#30363d] rounded-[3px] py-1 w-32 z-40 text-slate-355 shadow-lg">
            <button v-for="level in headingLevels" :key="'h' + level" type="button" @mousedown.prevent="() => { format('formatBlock', 'h' + level); isHeadingDropdownOpen = false }" class="w-full text-left px-3 py-1.5 hover:bg-[#2c333a] hover:text-white text-xs font-bold block">Headline {{ level }}</button>
            <div class="h-px bg-[#30363d] my-1"></div>
            <button type="button" @mousedown.prevent="() => { format('formatBlock', 'p'); isHeadingDropdownOpen = false }" class="w-full text-left px-3 py-1.5 hover:bg-[#2c333a] hover:text-white text-xs block">Normal text</button>
          </div>
        </div>

        <button type="button" @mousedown.prevent="format('bold')" class="hover:text-white cursor-pointer font-bold px-2 py-0.5 rounded hover:bg-white/5 text-slate-400 text-[13px]" title="Bold">B</button>
        <button type="button" @mousedown.prevent="format('italic')" class="hover:text-white cursor-pointer italic px-2 py-0.5 rounded hover:bg-white/5 text-slate-400 text-[13px] font-serif" title="Italic">I</button>
        <span class="hover:text-white cursor-pointer">...</span>
        <span class="text-slate-700">|</span>
        <button type="button" @mousedown.prevent="format('insertUnorderedList')" class="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/5" title="Bullet List">
          <IconList class="w-4 h-4 text-slate-400" />
        </button>
        <button type="button" @mousedown.prevent="format('insertOrderedList')" class="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/5" title="Numbered List">
          <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5h11M9 12h11M9 19h11M5 5v.01M5 12v.01M5 19v.01" /></svg>
        </button>
        <button type="button" @mousedown.prevent="promptForLink" class="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/5" title="Insert Link">
          <IconLink class="w-4 h-4 text-slate-400" />
        </button>
        <button type="button" @mousedown.prevent="triggerImageUpload" class="hover:text-white cursor-pointer p-0.5 rounded hover:bg-white/5" title="Insert Image File">
          <IconPhoto class="w-4 h-4 text-slate-400" />
        </button>
        <span class="hover:text-white cursor-pointer flex items-center gap-0.5">+ <IconChevronDown class="w-3 h-3" /></span>
      </div>
      <div class="flex items-center gap-3">
        <button type="button" @mousedown.prevent="triggerFileUpload" class="hover:text-white cursor-pointer flex items-center gap-1 hover:bg-white/5 px-1.5 py-0.5 rounded" title="Attach File">
          <IconPaperclip class="w-3.5 h-3.5" /> Attach
        </button>
        <span class="hover:text-white cursor-pointer font-mono text-[10px] bg-slate-800 px-1 rounded flex items-center gap-0.5">M↓</span>
        <span class="hover:text-white cursor-pointer font-semibold">?</span>
      </div>
    </div>

    <div
      ref="editorRef"
      contenteditable="true"
      :placeholder="placeholder"
      @input="onInput"
      class="rich-editor w-full bg-[#22272b] text-white text-xs px-3 py-2 focus:outline-none font-medium overflow-y-auto"
      :style="{ minHeight: minHeight || '120px', maxHeight: maxHeight || '250px' }"
      v-html="modelValue"
    ></div>
  </div>
</template>
