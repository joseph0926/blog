// @ts-check

/** @type {import('@lhci/cli').LighthouseCiRc} */
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
      settings: { preset: 'desktop' },
    },
    upload: { target: 'filesystem', outputDir: '.lhci' },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
      },
    },
  },
};
