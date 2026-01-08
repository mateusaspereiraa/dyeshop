import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/playwright',
  timeout: 30_000,
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    // Allow Playwright to use an already-running dev server (CI starts it separately)
    reuseExistingServer: true,
    timeout: 120_000,
    // expose test-only env vars to the dev server when running tests locally
    env: {
      ENABLE_TEST_ENDPOINTS: '1',
      STRIPE_WEBHOOK_SECRET: 'whsec_testsecret',
      STRIPE_SECRET_KEY: 'sk_test_123',
      DATABASE_URL: 'file:./test.db'
    }
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 5_000,
    baseURL: 'http://localhost:3000'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})
