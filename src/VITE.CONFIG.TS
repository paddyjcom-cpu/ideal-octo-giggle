import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src', // Tells Vite the source is now in the src folder
  build: {
    outDir: '../dist', // Builds to the project root's dist folder
    emptyOutDir: true
  }
});
