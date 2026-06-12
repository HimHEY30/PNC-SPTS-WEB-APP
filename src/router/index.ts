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
      meta: { requiresAuth: true },
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
        },
        {
          path: 'teachers',
          name: 'admin-teachers',
          component: () => import('@/views/admin/TeacherManagementView.vue'),
        },
        {
          path: 'tasks',
          name: 'admin-tasks',
          component: () => import('@/views/admin/FollowUpTimelineView.vue'),
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
          path: 'calendar',
          name: 'admin-calendar',
          component: () => import('@/views/admin/CalendarView.vue'),
        },
        {
          path: 'courses',
          name: 'admin-courses',
          component: () => import('@/views/admin/CourseManagementView.vue'),
        },
        {
          path: 'reports',
          name: 'admin-reports',
          component: () => import('@/views/admin/ReportsView.vue'),
        },
        {
          path: 'settings',
          name: 'admin-settings',
          component: () => import('@/views/admin/FollowUpTypesView.vue'),
        },
        {
          path: 'goals',
          name: 'admin-goals',
          component: () => import('@/views/admin/GoalSettingView.vue'),
        },
        {
          path: 'active',
          name: 'admin-active',
          component: () => import('@/views/admin/ActiveFollowUpsView.vue'),
        },
        {
          path: 'website',
          name: 'admin-website',
          component: () => import('@/views/admin/PncPortalView.vue'),
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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !auth.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
