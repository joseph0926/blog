import { chromium } from '@playwright/test';

import { browserExecutable, browserVersion } from './browser.cjs';

export default async function checkBrowser() {
  const browser = await chromium.launch({
    executablePath: browserExecutable,
    chromiumSandbox: true,
  });
  try {
    if (browser.version() !== browserVersion) {
      throw new Error(
        `Chrome for Testing ${browserVersion} required; found ${browser.version()}. Run corepack pnpm browser:install.`,
      );
    }
  } finally {
    await browser.close();
  }
}
