import { defineConfig, devices } from '@playwright/test';

import { browserExecutable } from './browser.cjs';

export default defineConfig({
  testDir: '.',
  globalSetup: './global-setup.ts',
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
        // 로컬과 CI에서 보안 수정된 같은 Chrome for Testing 버전을 사용한다.
        channel: 'chromium',
        launchOptions: {
          executablePath: browserExecutable,
          chromiumSandbox: true,
        },
      },
    },
  ],
  webServer: {
    command: 'pnpm --filter @joseph0926/blog dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
