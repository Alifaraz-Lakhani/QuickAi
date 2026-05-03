import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  cacheDir: '.vite-temp',
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://server:4000', // 'server' is the name from your compose file
        changeOrigin: true,
        secure: false,
      },
    },
  },
})