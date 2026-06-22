<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import { IconChevronDown } from '@tabler/icons-vue'

export interface DropdownOption {
  value: string
  label: string
  count?: number
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: DropdownOption[]
    placeholder?: string
    icon?: Component
    position?: 'left' | 'right'
    width?: string
    size?: 'md' | 'sm'
    fullWidth?: boolean
    shadow?: boolean
    dark?: boolean
  }>(),
  {
    placeholder: 'Select...',
    position: 'left',
    width: 'w-48',
    size: 'md',
    fullWidth: false,
    shadow: true,
    dark: false,
  },
)

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
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt ? opt.label : props.placeholder
})
</script>

<template>
  <div class="relative select-none" :class="{ 'w-full': fullWidth }" v-click-outside="close">
    <button
      type="button"
      @click="toggle"
      class="flex items-center gap-2 rounded-[3px] text-xs font-bold transition-colors border"
      :class="[
        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
        fullWidth ? 'w-full' : 'min-w-[160px]',
        shadow ? 'shadow-sm' : '',
        dark
          ? 'bg-[#22272b] text-white border-[#30363d] hover:bg-[#2a3036]'
          : 'bg-white text-[#1e293b] border-slate-200/60 hover:bg-slate-50',
      ]"
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
        :class="[
          'absolute mt-2 rounded-[3px] py-1 z-30 overflow-hidden border',
          position === 'right' ? 'right-0' : 'left-0',
          fullWidth ? 'w-full' : width,
          shadow ? 'shadow-sm' : '',
          dark ? 'bg-[#22272b] border-[#30363d] text-white' : 'bg-white border-slate-200/60 text-[#1e293b]',
        ]"
      >
        <button
          type="button"
          v-for="opt in options"
          :key="opt.value"
          @click="select(opt.value)"
          class="w-full text-left px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between gap-2"
          :class="[
            dark ? 'text-slate-300 hover:bg-[#2c333a] hover:text-white' : 'text-slate-700 hover:bg-slate-50',
            modelValue === opt.value ? (dark ? 'text-[#ff9c07] bg-[#2c333a]' : 'text-[#ff9c07] bg-slate-50/50') : '',
          ]"
        >
          <span>{{ opt.label }}</span>
          <span
            v-if="opt.count !== undefined"
            class="text-[10px] text-slate-400 font-bold shrink-0"
            >{{ opt.count }}</span
          >
        </button>
      </div>
    </Transition>
  </div>
</template>
