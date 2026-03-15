import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // GitHub Pages serves from /DrRoma/ — set base to match repo name
  base: '/DrRoma/',

  build: {
    outDir: 'dist',
    minify: false,
    target: 'esnext',
    // Increase chunk size warning limit (the app is intentionally large)
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          react: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})