import { defineConfig, devices } from '@playwright/test';
import { targetBaseUrl } from './support/target';

export default defineConfig({
  testDir: './specs',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    // Defaults to http://localhost:4200; E2E_BASE_URL overrides it. Note the
    // write-heavy specs this config runs are localhost-only by design — see
    // support/target.ts and playwright.prod.config.ts.
    baseURL: targetBaseUrl(),
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
