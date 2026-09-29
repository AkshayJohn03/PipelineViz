import { defineConfig } from 'vite';

// Static, dependency-free deploy: relative base works on Vercel, GitHub Pages
// and `file` previews alike. No plugins — the site is plain ES modules.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1200
  },
  server: {
    host: true
  },
  preview: {
    host: true
  }
});
