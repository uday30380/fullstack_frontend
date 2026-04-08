import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendHost = globalThis.process?.env?.VITE_API_HOST || '127.0.0.1'
const backendPort = globalThis.process?.env?.VITE_API_PORT || '8082'
const backendTarget = globalThis.process?.env?.VITE_API_URL || `http://${backendHost}:${backendPort}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split('\\').join('/')

          if (!normalizedId.includes('node_modules')) {
            return undefined
          }

          if (normalizedId.includes('framer-motion')) {
            return 'motion'
          }

          if (normalizedId.includes('react-router')) {
            return 'router'
          }

          if (
            normalizedId.includes('react-dom') ||
            normalizedId.includes('/react/') ||
            normalizedId.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }

          return 'vendor'
        }
      }
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
        timeout: 900000,
        proxyTimeout: 900000,
        headers: {
          Connection: 'keep-alive'
        }
      }
    }
  }
})
