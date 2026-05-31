<script setup lang="ts">
// A popup/modal that shows on top of everything else
// Set `open` to true to show it, false to hide it

interface Props {
  open: boolean
  title?: string
}

defineProps<Props>()

// Tells the parent when user clicks the X or clicks outside to close
const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <!-- Teleport sends this to the end of <body> so it sits above everything -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="emit('close')"
    >
      <!-- Stop click from closing when clicking inside the modal itself -->
      <div
        class="bg-white rounded-2xl w-full max-w-lg p-6"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">
            {{ title }}
          </h2>

          <button @click="emit('close')">
            ✕
          </button>
        </div>

        <!-- Whatever you put inside the <BaseModal> tags goes here -->
        <slot />
      </div>
    </div>
  </Teleport>
</template>