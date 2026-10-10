import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3300,
    open: false,
    host: true
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-phaser': ['phaser'],
          'vendor-capacitor': [
            '@capacitor/core',
            '@capacitor/app',
            '@capacitor/haptics',
            '@capacitor/screen-orientation',
            '@capacitor/status-bar'
          ]
        }
      }
    }
  }
});
