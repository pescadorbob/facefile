import { defineConfig, devices } from '@playwright/test';
import { targetBaseUrl } from './support/target';

export default defineConfig({
  testDir: './specs',
  // Raised from 30s for E-4.6: the dashboard notices newly due cards on its own 15s
  // refresh, so a spec asserting that has to be allowed to outlast one full interval
  // on top of its own setup. Only the duration of a *failing* test changes.
  timeout: 60_000,
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
