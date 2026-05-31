<script setup lang="ts">
// A spinning loading indicator - show this whenever something is loading
// You can make it small, medium, large, or full-screen with optional text underneath

interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  text: '',
  fullScreen: false,
})

// Map size names to actual Tailwind classes
// sm = thin border, lg = thick border
const spinnerSize = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-4',
}
</script>

<template>
  <div
    :class="
      fullScreen
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm'
        : 'flex items-center justify-center'
    "
  >
    <div class="flex flex-col items-center gap-3">
      <!-- Spinner -->
      <div
        class="animate-spin rounded-full border-blue-600 border-t-transparent"
        :class="spinnerSize[props.size]"
      />

      <!-- Optional Text -->
      <p
        v-if="text"
        class="text-sm text-gray-600"
      >
        {{ text }}
      </p>
    </div>
  </div>
</template>