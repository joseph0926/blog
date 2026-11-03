const {
  Browser,
  computeExecutablePath,
  install,
} = require('@puppeteer/browsers');
const path = require('node:path');

// Playwright 1.64.1 bundles 156.0.8078.4, before the October 29 security fixes.
const browserVersion = '156.0.8078.80';
const installation = {
  browser: Browser.CHROME,
  buildId: browserVersion,
  cacheDir: path.resolve(__dirname, '../.cache/browsers'),
};
const browserExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  computeExecutablePath(installation);

module.exports = { browserVersion, browserExecutable };

if (require.main === module) {
  install(installation)
    .then((browser) =>
      console.log(
        `Chrome for Testing ${browserVersion}: ${browser.executablePath}`,
      ),
    )
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
