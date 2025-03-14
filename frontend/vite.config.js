import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ...existing code...
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Update target to the backend port (5000)
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
