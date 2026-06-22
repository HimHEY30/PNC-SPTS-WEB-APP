<script setup lang="ts">
// Redesigned login page matching the "Testdino" style
// Clean, white card on light gray background with blurred mesh circles

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconEye, IconEyeOff, IconMail, IconLock } from '@tabler/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/services/api'
import logoSrc from '@/assets/images/logo1.png'

const auth = useAuthStore()
const router = useRouter()

// Form state
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

// Submission handler
const submit = async (e: Event) => {
  e.preventDefault()
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true

  try {
    const success = await auth.login({
      email: email.value,
      password: password.value,
    })

    if (success) {
      router.push('/board')
    } else {
      error.value = 'Invalid credentials'
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Failed to login. Please check your credentials.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="relative min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-4 overflow-hidden text-slate-800"
  >
    <!-- Background blurred accent blobs for premium depth (glassmorphism/mesh effect) -->
    <div
      class="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-indigo-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-sky-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[10000ms]"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-200/30 rounded-full blur-3xl -z-10"
    ></div>

    <!-- Login Card Container -->
    <div
      class="w-full max-w-[420px] bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 z-10"
    >
      <!-- Logo Header -->
      <div class="flex flex-col items-center mb-8">
        <div class="flex items-center gap-2 mb-6">
          <img :src="logoSrc" class="h-8 w-auto object-contain" alt="Logo" />
          <span class="text-[22px] font-bold text-slate-900 tracking-tight">PNC SPTS</span>
        </div>
        <h1 class="text-[24px] font-bold text-slate-900 tracking-tight text-center">
          Sign into your account
        </h1>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-lg text-xs mb-6 text-center font-medium"
      >
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit="submit" class="flex flex-col gap-5">
        <!-- Email Field -->
        <div class="space-y-1.5 text-left">
          <label class="block text-sm font-semibold text-slate-700">Email</label>
          <div class="relative">
            <IconMail
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            />
            <input
              type="email"
              v-model="email"
              class="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-3.5 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
              placeholder="Enter your email address"
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5 text-left">
          <label class="block text-sm font-semibold text-slate-700">Password</label>
          <div class="relative">
            <IconLock
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            />
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              class="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer flex items-center"
            >
              <IconEyeOff v-if="!showPassword" class="w-4 h-4" />
              <IconEye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Options Row -->
        <div class="flex items-center justify-between text-sm mt-1">
          <label
            class="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 transition-colors select-none"
          >
            <input
              type="checkbox"
              v-model="rememberMe"
              class="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
            />
            <span>Remember me</span>
          </label>
          <a
            href="#"
            class="text-slate-600 hover:text-slate-800 hover:underline transition-colors font-medium"
            >Forget password</a
          >
        </div>

        <!-- Sign In Button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition-all text-sm mt-4 disabled:opacity-70 active:scale-[0.99] cursor-pointer shadow-sm"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Ensure custom inputs don't have focus rings that override custom borders */
input:focus {
  outline: none;
}
</style>
