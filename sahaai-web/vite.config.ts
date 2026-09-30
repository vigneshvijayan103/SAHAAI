import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: 'http://localhost:51386',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:51386',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})

