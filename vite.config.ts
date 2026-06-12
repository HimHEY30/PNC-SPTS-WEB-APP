import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // General target for all API and asset routes (pointing to localhost by default)
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [
      vue(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // Fallback for all API routes (including teachers, classes, users, etc.)
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        // General uploads folder (student and user profile images)
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      }
    }
  }
})
