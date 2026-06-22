import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import StudentBoard from '@/views/StudentBoard.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

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
      meta: { requiresAuth: true, roles: ['SUPER_ADMIN', 'ADMIN', 'TUTOR', 'TEACHER'] },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserManagementView.vue'),
          meta: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        },
        {
          path: 'teachers',
          name: 'admin-teachers',
          component: () => import('@/views/admin/TeacherManagementView.vue'),
          meta: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        },
        {
          path: 'tasks',
          name: 'admin-tasks',
          component: () => import('@/views/admin/FollowUpTimelineView.vue'),
          meta: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_MANAGER', 'FOLLOWUP_OFFICER'] },
        },
        {
          path: 'students',
          name: 'admin-students',
          component: () => import('@/views/admin/StudentListView.vue'),
        },
        {
          path: 'students/:id',
          name: 'admin-student-profile',
          component: () => import('@/views/admin/StudentDetailsView.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/views/admin/FollowUpTypesView.vue'),
          meta: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        },
        {
          path: 'active',
          name: 'admin-active',
          component: () => import('@/views/admin/ActiveFollowUpsView.vue'),
          meta: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACADEMIC_MANAGER', 'FOLLOWUP_OFFICER'] },
        },
        {
          path: 'profile',
          name: 'admin-profile',
          component: () => import('@/views/admin/ProfileView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  if (requiresAuth && !auth.isAuthenticated) {
    next('/')
    return
  }

  // Check role-based access if authenticated
  if (auth.isAuthenticated) {
    const userRoles = auth.user?.roles || []

    // Find if any matched route requires specific roles
    const requiredRoles = to.matched.reduce<string[]>((acc, record) => {
      if (record.meta && Array.isArray(record.meta.roles)) {
        return record.meta.roles
      }
      return acc
    }, [])

    if (requiredRoles.length > 0) {
      const hasAllowedRole = requiredRoles.some((role) => userRoles.includes(role))
      if (!hasAllowedRole) {
        // User not authorized for this page, redirect to admin dashboard
        next('/admin')
        return
      }
    }
  }

  next()
})

export default router
