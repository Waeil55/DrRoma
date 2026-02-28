import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is mandatory for GitHub Pages subdirectories, otherwise it results in a blank white page!
  base: '/DrMariam/', 
})


