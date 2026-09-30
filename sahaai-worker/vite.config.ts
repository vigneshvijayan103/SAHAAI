import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dedicated Worker Application on port 5174
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
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
});

