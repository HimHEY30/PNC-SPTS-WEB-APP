<script setup lang="ts">
// The login page - just a simple form with email/password fields
// Clicking Sign In logs you in with a demo account

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

// Form state - these are bound to the inputs below with v-model
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const loading = ref(false)

// Runs when user clicks the Sign In button
// Now connects to the API via the auth store
const submit = async (e: Event) => {
  e.preventDefault()
  error.value = ''
  loading.value = true

  try {
    // Call the API with the email and password
    await auth.login({
      email: email.value,
      password: password.value,
    })

    // If successful, go to the board
    router.push('/board')
  } catch (err: any) {
    // If the API returns an error, display it in the 'error' div
    // We check auth.error first (in case the store set it), otherwise use a generic message
    error.value = auth.error || 'Login failed. Please check your credentials.'
  } finally {
    // Always stop the loading animation
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Sign In</h1>
      <p class="subtitle">Welcome back! Please enter your details</p>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <form @submit="submit">
        <div class="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            v-model="email"
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label>Password</label>
          <div class="password-wrap">
            <input
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              v-model="password"
              autocomplete="current-password"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              <svg
                v-if="showPassword"
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="demo-info">
        <p class="demo-label">Demo Account</p>
        <p class="demo-creds">admin@admin.com / admin</p>
      </div>
    </div>
  </div>
</template>
