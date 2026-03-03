import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Replace 'DrMariam' with your exact repository name if different
  base: '/DrMariam/', 
})