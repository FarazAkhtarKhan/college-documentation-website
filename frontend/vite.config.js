import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ...existing code...
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://college-documentation-website.onrender.com',
        changeOrigin: true,
      },
    },
  },
})
