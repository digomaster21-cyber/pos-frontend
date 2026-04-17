import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Business Dashboard',
        short_name: 'BizDash',
        description: 'Business Management PWA',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // ✅ Increase the file size limit to 5MB
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          },
          {
            urlPattern: /\/api\/dashboard\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'dashboard-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60
              }
            }
          },
          {
            urlPattern: /\/api\/inventory/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'inventory-api-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 2
              }
            }
          },
          // ✅ Add API cache for your Render backend
          {
            urlPattern: /^https:\/\/master-project-bjaz\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pos-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // ✅ Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // ✅ Rollup options for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks to reduce main bundle size
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'chart-vendor': ['recharts', 'dayjs'],
          'pdf-vendor': ['jspdf', 'html2canvas', 'jspdf-autotable'],
          'xlsx-vendor': ['xlsx'],
          'vendor': ['axios', 'lodash', 'zustand']
        }
      }
    }
  },
  // ✅ Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'antd', '@ant-design/icons']
  }
});