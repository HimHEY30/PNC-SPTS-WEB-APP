<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { IconChevronDown } from '@tabler/icons-vue'

export interface DropdownOption {
  value: string
  label: string
  count?: number
}

const props = withDefaults(defineProps<{
  modelValue: string | number
  options: DropdownOption[]
  placeholder?: string
  icon?: Component
  position?: 'left' | 'right'
  width?: string
  size?: 'md' | 'sm'
}>(), {
  placeholder: 'Select...',
  position: 'left',
  width: 'w-48',
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const close = () => {
  isOpen.value = false
}

const select = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt ? opt.label : props.placeholder
})
</script>

<template>
  <div class="relative select-none" v-click-outside="close">
    <button
      @click="toggle"
      class="flex items-center gap-2 bg-white rounded-[3px] text-xs font-bold text-[#1e293b] hover:bg-slate-50 transition-colors shadow-sm"
      :class="size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2 min-w-[160px]'"
    >
      <component :is="icon" v-if="icon" class="h-4 w-4 text-slate-400 shrink-0" />
      <span class="flex-1 truncate text-left">{{ selectedLabel }}</span>
      <IconChevronDown
        class="h-4 w-4 opacity-60 transition-transform shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="['absolute mt-2 bg-white rounded-[3px] shadow-sm py-1 z-30 overflow-hidden', position === 'right' ? 'right-0' : 'left-0', width]"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          @click="select(opt.value)"
          class="w-full text-left px-4 py-2 text-xs font-bold text-gray-700 hover:bg-slate-50 flex items-center justify-between gap-2 transition-colors"
          :class="{ 'text-indigo-600 bg-indigo-50/30': modelValue === opt.value }"
        >
          <span>{{ opt.label }}</span>
          <span v-if="opt.count !== undefined" class="text-[10px] text-slate-400 font-bold shrink-0">{{ opt.count }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>
