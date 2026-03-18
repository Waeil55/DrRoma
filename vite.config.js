import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // GitHub Pages serves from /DrRoma/ — set base to match repo name
  base: '/DrRoma/',

  build: {
    outDir: 'dist',
    minify: 'esbuild',
    target: 'es2019',
    // Increase chunk size warning limit (the app is intentionally large)
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Split chunks to reduce peak memory during JS parsing:
        // – Each chunk file is parsed independently, lowering iOS Safari OOM risk
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('Counseling.js')) return 'data-counseling';
          if (id.includes('Diseases.js')) return 'data-diseases';
          if (id.includes('drugData.js')) return 'data-drugs';
          if (id.includes('lawData.js')) return 'data-law';
          if (id.includes('diseaseDatabase.js')) return 'data-disease-db';
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})