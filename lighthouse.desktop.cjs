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
        performance: ['warn', { minScore: 0.8 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2300 }],
        interactive: ['error', { maxNumericValue: 3800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // TODO: 개선 후 error등으로 올릴 예정 - 2025.06.15 joseph0926
        'image-delivery-insight': ['off'],
        'color-contrast': ['warn'],
        'link-name': ['warn'],
        list: ['off'],
        'meta-description': ['warn'],
        'bf-cache': ['off'],
        'forced-reflow-insight': ['off'],
        'legacy-javascript-insight': ['warn'],
        'unused-javascript': ['warn'],
        'network-dependency-tree-insight': ['off'],
        'lcp-discovery-insight': ['warn'],
        'uses-responsive-images': ['warn'],
      },
    },
  },
};
