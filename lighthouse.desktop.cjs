/// <reference types="@lhci/cli/types/Config" />
const { BASE_URL = 'http://localhost:3000', APP_VERSION = 'local' } =
  process.env;

module.exports = {
  ci: {
    collect: {
      startServerCommand: BASE_URL.startsWith('http')
        ? undefined
        : 'pnpm start --port 3000',
      startServerReadyPattern: BASE_URL.startsWith('http')
        ? undefined
        : 'ready on.*3000',
      startServerReadyTimeout: 120_000,

      url: require('./lh-urls.json').map((path) => `${BASE_URL}${path}`),

      numberOfRuns: 3,

      settings: {
        preset: 'desktop',
        throttlingMethod: 'devtools',
        screenEmulation: {
          width: 1366,
          height: 768,
          deviceScaleFactor: 1,
          disabled: false,
        },
        formFactor: 'desktop',
        disableStorageReset: true,
      },
      puppeteerLaunchOptions: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: `.lhci/${APP_VERSION}/desktop`,
      reportFilenamePattern: 'report-%%PATHNAME%%-%%DATETIME%%.html',
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'metrics/largest-contentful-paint': [
          'error',
          { maxNumericValue: 2300 },
        ],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'metrics/interactive': ['error', { maxNumericValue: 3800 }],
      },
    },
  },
};
