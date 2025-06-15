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
      url: require('./lh-urls.json').map((p) => `${BASE_URL}${p}`),
      numberOfRuns: 1,
      settings: {
        preset: 'mobile',
        throttlingMethod: 'devtools',
        formFactor: 'mobile',
        disableStorageReset: true,
      },
      puppeteerLaunchOptions: {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    },

    upload: {
      target: 'filesystem',
      outputDir: `.lhci/${APP_VERSION}/mobile`,
      reportFilenamePattern: 'report-%%PATHNAME%%-%%DATETIME%%.html',
    },

    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        performance: ['error', { minScore: 0.85 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        interactive: ['error', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // TODO: 개선 후 error등으로 올릴 예정 - 2025.06.15 joseph0926
        'color-contrast': ['warn'],
        'link-name': ['warn'],
        list: ['off'],
        'legacy-javascript-insight': ['warn'],
        'render-blocking-insight': ['warn'],
        'lcp-discovery-insight': ['warn'],
        'uses-responsive-images': ['warn'],
      },
    },
  },
};
