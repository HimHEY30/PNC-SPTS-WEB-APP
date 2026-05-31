// This is where the app boots up - wires everything together and mounts it to the page

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import "@/assets/main.css"

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Pinia handles all the app-wide state (like who's logged in)
app.use(createPinia())
// Router handles page navigation
app.use(router)

// Attach everything to the <div id="app"> in index.html
app.mount('#app')
