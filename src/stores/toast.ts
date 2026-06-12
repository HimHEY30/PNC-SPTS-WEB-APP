import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', () => {
  const show = ref(false)
  const message = ref('')
  const type = ref<'success' | 'error'>('success')
  let timer: ReturnType<typeof setTimeout> | null = null

  function showToast(msg: string, toastType: 'success' | 'error' = 'success') {
    if (timer) clearTimeout(timer)
    message.value = msg
    type.value = toastType
    show.value = true
    timer = setTimeout(() => {
      show.value = false
    }, 3000)
  }

  function hideToast() {
    show.value = false
    if (timer) clearTimeout(timer)
  }

  return { show, message, type, showToast, hideToast }
})
