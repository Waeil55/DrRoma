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
    // es2019 ensures optional-chaining (?.) and nullish-coalescing (??) are
    // transpiled to ternary chains compatible with Safari 13/iOS 13 and older.
    // Leaving these as native syntax (es2020/safari14) causes SyntaxError crashes
    // on iOS < 14, which still represents a meaningful share of users.
    target: 'es2019',
    // Increase chunk size warning limit (the app is intentionally large)
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Split chunks so iOS Safari JIT-compiles each file separately.
        // A single 1.5 MB JS file can exceed WebKit's WatchDog budget;
        // splitting keeps each chunk under ~400 KB (uncompressed).
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'react';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          // Large data modules – each goes in its own chunk
          if (id.includes('Counseling.js'))        return 'data-counseling';
          if (id.includes('Diseases.js'))          return 'data-diseases';
          if (id.includes('drugData.js'))          return 'data-drugs';
          if (id.includes('lawData.js'))           return 'data-law';
          if (id.includes('diseaseDatabase.js'))   return 'data-disease-db';
          // ↓ These three were missing and caused ~400 KB to bleed into the App chunk
          if (id.includes('medicineDatabase.js'))  return 'data-medicine-db';
          if (id.includes('symptomsDatabase.js'))  return 'data-symptoms-db';
          if (id.includes('counselingDatabase.js')) return 'data-counseling-db';
          // Modular component/service imports — keep out of the main App chunk
          if (id.includes('/components/') || id.includes('/services/') || id.includes('/hooks/')) return 'app-modules';
        },
      },
    },
  },

  server: {
    port: 3000,
    open: true,
  },
})