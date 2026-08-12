import { defineConfig, devices } from '@playwright/test';
import { targetBaseUrl } from './support/target';

// Defaulted here rather than in the npm script: `FOO=bar cmd` is not valid
// syntax in cmd or PowerShell, and this repo is developed on Windows. Point the
// run at another branch or a custom domain by setting E2E_BASE_URL instead.
process.env.E2E_BASE_URL ??= 'https://main.d3gf337s2ynps.amplifyapp.com';

export default defineConfig({
  // Deliberately narrower than the main config's ./specs. Every other spec
  // creates data and then clears it through the API, and a deployed
  // environment has exactly one shared user to create it against — see
  // support/target.ts.
  testDir: './specs/smoke',
  // Resolves the deployed API endpoint from the target's own
  // /amplify_outputs.json into E2E_API_URL.
  globalSetup: './support/resolve-deployed-api.ts',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  // There is a real network and a CloudFront edge in front of the app here,
  // unlike `ng serve`, so a lone timeout is not automatically a regression.
  retries: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
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
