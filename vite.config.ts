import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@driver-app/shared'],
  },
  build: {
    commonjsOptions: {
      include: [/@driver-app\/shared/, /node_modules/],
    },
  },
})
