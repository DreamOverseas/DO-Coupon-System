// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // Enables Fast Refresh, JSX transforms, etc.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Mirror CRA’s absolute imports: "src/..."
      '@': '/src',
    },
    extensions: ['.js', '.jsx'],
  },
  server: {
    // If you had CRA’s "proxy" in package.json, replicate it here:
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // If you use environment variables that begin with VITE_, no extra prefix config is needed.
});
