import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // predeterminado para localhost y Netlify
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // redirige todo lo que empieza con /api al backend
    },
  },
})
