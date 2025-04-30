import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy requests starting with /reddit_proxy to www.reddit.com
      '/reddit_proxy': {
        target: 'https://www.reddit.com',
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false,      // Often needed for https targets
        rewrite: (path) => path.replace(/^\/reddit_proxy/, ''), // Remove the prefix
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
})
