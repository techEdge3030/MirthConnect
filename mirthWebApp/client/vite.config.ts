import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for all assets
  server: {
    host: '0.0.0.0'
  },
  optimizeDeps: {
    include: ['@emotion/styled', '@emotion/react'],
  },
})
