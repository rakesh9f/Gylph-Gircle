
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This ensures paths for JS and CSS are relative to index.html
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000
  }
});
