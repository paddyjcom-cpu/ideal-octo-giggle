import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Remove 'root' if index.html is in your project's top-level folder
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
