<script setup lang="ts">
// A ready-to-use confirmation dialog - ask the user "are you sure?" before doing something important
// Handles the backdrop click, cancel, and confirm for you

import BaseButton from '@/components/ui/buttons/BaseButton.vue'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  danger?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Confirmation',
  message: 'Are you sure you want to continue?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loading: false,
  danger: false,
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}>()

// If user clicks the dark area outside the dialog, treat it like closing
const handleBackdropClick = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        @click="handleBackdropClick"
      >
        <div
          class="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div class="border-b px-6 py-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full"
                :class="
                  danger
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                  />
                </svg>
              </div>

              <div>
                <h2 class="text-lg font-semibold text-gray-800">
                  {{ title }}
                </h2>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <p class="text-sm leading-relaxed text-gray-600">
              {{ message }}
            </p>
          </div>

          <!-- Footer -->
          <div
            class="flex items-center justify-end gap-3 border-t px-6 py-4"
          >
            <BaseButton
              variant="secondary"
              @click="emit('cancel')"
            >
              {{ cancelText }}
            </BaseButton>

            <BaseButton
              :variant="danger ? 'danger' : 'primary'"
              :loading="loading"
              @click="emit('confirm')"
            >
              {{ confirmText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>