import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  globalSetup: './tests/fixtures/global-setup.ts',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: {
    // Ensure feature flag for new UI library is enabled during tests + run DB migrations/seed first
    // Use cross-env for cross-platform env var setting
    command: process.env.CI
      ? 'npm run pretest:e2e && cross-env NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npm run start'
      : 'npm run pretest:e2e && cross-env NEXT_PUBLIC_FEATURE_UI_LIBRARY=true npm run dev',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});


