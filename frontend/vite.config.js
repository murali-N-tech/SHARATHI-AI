import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    // ✅ ADD THIS
    allowedHosts: [
      '7f8f881b2804.ngrok-free.app',
    ],

    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/ngrok-api': {
        target: 'https://156ea82c07d0.ngrok-free.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
