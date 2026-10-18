import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 3300,
    open: false,
    host: true
  },
  plugins: [
    {
      name: 'wiki-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/wiki') {
            res.writeHead(301, { Location: '/wiki/' });
            res.end();
            return;
          }
          next();
        });
      }
    }
  ],
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      input: {
        main: './index.html',
        wiki: './wiki/index.html'
      },
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
