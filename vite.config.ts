import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.GITHUB_ACTIONS ? '/drunkfield/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src/sw',
      filename: 'reminder.ts',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'DrunkField',
        short_name: 'DrunkField',
        description: 'Tracker de binches au Greenfield Festival',
        theme_color: '#16a34a',
        background_color: '#000000',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
  },
})
