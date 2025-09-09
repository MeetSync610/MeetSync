import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/MeetSync/', // 👈 Muy importante, el nombre exacto de tu repo
})
