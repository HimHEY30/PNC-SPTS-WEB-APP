// This is where the app boots up - wires everything together and mounts it to the page

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/assets/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.directive('click-outside', {
  mounted(el: HTMLElement, binding) {
    const handler = (event: MouseEvent) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value()
      }
    }
    const element = el as HTMLElement & { __clickOutside?: (event: MouseEvent) => void }
    element.__clickOutside = handler
    document.addEventListener('click', handler)
  },
  unmounted(el: HTMLElement) {
    const element = el as HTMLElement & { __clickOutside?: (event: MouseEvent) => void }
    if (element.__clickOutside) {
      document.removeEventListener('click', element.__clickOutside)
    }
  },
})

app.use(createPinia())
app.use(router)

app.mount('#app')
