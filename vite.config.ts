import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
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
    // Force the port to be 5173 to match the server's CORS policy
    port: 5173,
    // strictPort: true will stop the server if 5173 is busy,
    // helping you identify if another app is using it.
    strictPort: true,
    proxy: {
      // Keep the proxy config here, though we are using Direct Connection currently.
      // It doesn't hurt to have it.
      '/api': {
        target: 'https://pnc-spts-stg-api.me',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
