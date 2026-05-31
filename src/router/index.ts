// Defines all the pages (routes) in the app and who can see them
// The auth guard below makes sure people can't sneak into /board without logging in

import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import StudentBoard from '@/views/StudentBoard.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/board',
      name: 'board',
      component: StudentBoard,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard - runs before every page change
// If the page needs auth and user isn't logged in, kick them back to login
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
