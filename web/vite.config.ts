import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vitest config: keep unit tests in src/ only. The Playwright E2E spec lives
// under e2e/ and is owned by `npm run e2e`, not by `npm test`.
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'e2e/**'],
    environment: 'node',
  },
})
