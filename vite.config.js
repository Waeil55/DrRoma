import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
  // base: '/DrMariam/', <-- Remove or comment out this line!
})