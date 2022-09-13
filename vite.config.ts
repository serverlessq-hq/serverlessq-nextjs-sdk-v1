import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    setupFiles: ['./tests/setup.ts'],
    env: {
      SERVERLESSQ_API_TOKEN: 'test'
    }
  }
})
