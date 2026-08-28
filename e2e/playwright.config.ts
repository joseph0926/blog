import { chromium, defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const chromiumExecutable = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  chromium.executablePath(),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((candidate) => candidate && existsSync(candidate));

if (!chromiumExecutable) {
  throw new Error(
    'Playwright-compatible Chromium was not found. Install the matching browser or set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH.',
  );
}

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: chromiumExecutable },
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @joseph0926/blog dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
