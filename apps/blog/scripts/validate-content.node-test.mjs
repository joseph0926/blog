import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { validateContent } from './validate-content.mjs';

const tempRoots = [];

const hash = (value) =>
  `sha256:${createHash('sha256').update(value).digest('hex')}`;

const emptyBaseline = () => ({
  schemaVersion: 1,
  missingSourceHash: [],
  slugMismatch: [],
});

const frontmatter = ({
  slug,
  sourceHash,
  tags = "['react']",
  thumbnail = '/post/example.webp',
}) => `---
slug: '${slug}'
title: 'Title'
description: 'Description'
date: '2026-08-28'
tags: ${tags}
thumbnail: '${thumbnail}'
${sourceHash ? `sourceHash: '${sourceHash}'\n` : ''}---

`;

const createFixture = () => {
  const appRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'blog-content-validator-'),
  );
  tempRoots.push(appRoot);
  fs.mkdirSync(path.join(appRoot, 'src/mdx'), { recursive: true });
  fs.mkdirSync(path.join(appRoot, 'public/post'), { recursive: true });
  fs.writeFileSync(path.join(appRoot, 'public/post/example.webp'), 'image');
  fs.writeFileSync(
    path.join(appRoot, 'src/mdx/component-registry.ts'),
    'export const MDX_COMPONENT_LOADERS = {\n  Demo: async () => null,\n};\n',
  );
  return appRoot;
};

const writePair = ({
  appRoot,
  slug,
  sourceSlug = slug,
  translationSlug = slug,
  tags,
  thumbnail,
  body = '<Demo />\n',
  withHash = true,
}) => {
  const korean = `${frontmatter({
    slug: sourceSlug,
    tags,
    thumbnail,
  })}${body}`;
  const english = `${frontmatter({
    slug: translationSlug,
    tags,
    thumbnail,
    sourceHash: withHash ? hash(korean) : undefined,
  })}${body}`;
  fs.writeFileSync(path.join(appRoot, `src/mdx/${slug}.mdx`), korean);
  fs.writeFileSync(path.join(appRoot, `src/mdx/${slug}.en.mdx`), english);
};

const missingHashBaseline = ({ appRoot, slug }) => {
  const sourcePath = `src/mdx/${slug}.mdx`;
  const translationPath = `src/mdx/${slug}.en.mdx`;
  return {
    schemaVersion: 1,
    missingSourceHash: [
      {
        sourcePath,
        sourceFileHash: hash(fs.readFileSync(path.join(appRoot, sourcePath))),
        translationPath,
        translationFileHash: hash(
          fs.readFileSync(path.join(appRoot, translationPath)),
        ),
      },
    ],
    slugMismatch: [],
  };
};

const slugMismatchBaseline = ({ appRoot, slug, actual }) => {
  const repoPath = `src/mdx/${slug}.en.mdx`;
  return {
    schemaVersion: 1,
    missingSourceHash: [],
    slugMismatch: [
      {
        path: repoPath,
        fileHash: hash(fs.readFileSync(path.join(appRoot, repoPath))),
        expected: slug,
        actual,
      },
    ],
  };
};

const validateFixture = (appRoot, legacyBaseline) =>
  validateContent({ appRoot, repoRoot: appRoot, legacyBaseline });

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('빈 baseline에서 현재 hash를 가진 locale pair를 허용한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug });

  const result = validateFixture(appRoot, emptyBaseline());

  assert.deepEqual(result.errors, []);
});

test('오래된 sourceHash를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug });
  const englishPath = path.join(appRoot, `src/mdx/${slug}.en.mdx`);
  const english = fs
    .readFileSync(englishPath, 'utf8')
    .replace(/sha256:[a-f0-9]{64}/, `sha256:${'0'.repeat(64)}`);
  fs.writeFileSync(englishPath, english);

  const result = validateFixture(appRoot, emptyBaseline());

  assert.equal(
    result.errors.some((error) => error.includes('현재 원문과 다릅니다')),
    true,
  );
});

test('일치하는 sourceHash legacy pair를 허용한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });

  const result = validateFixture(appRoot, baseline);

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.approvedLegacyMissingSourceHash, 1);
});

test('legacy 한국어 원문을 변경하면 baseline 불일치로 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });
  fs.appendFileSync(path.join(appRoot, `src/mdx/${slug}.mdx`), 'changed\n');

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) =>
      error.includes('baseline과 일치하지 않습니다'),
    ),
    true,
  );
});

test('legacy 영어 번역본을 변경하면 baseline 불일치로 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });
  fs.appendFileSync(path.join(appRoot, `src/mdx/${slug}.en.mdx`), 'changed\n');

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) =>
      error.includes('baseline과 일치하지 않습니다'),
    ),
    true,
  );
});

test('baseline에 없는 sourceHash 누락을 거부한다', () => {
  const appRoot = createFixture();
  writePair({ appRoot, slug: '2026-08-28-example', withHash: false });

  const result = validateFixture(appRoot, emptyBaseline());

  assert.equal(
    result.errors.some((error) => error.includes('sourceHash 누락')),
    true,
  );
});

test('sourceHash 문제를 해결한 뒤 남은 baseline entry를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });
  writePair({ appRoot, slug, withHash: true });

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) => error.includes('stale entry')),
    true,
  );
});

test('일치하는 slug legacy file을 허용한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  const actual = '2026-08-28-legacy-example';
  writePair({ appRoot, slug, translationSlug: actual });
  const baseline = slugMismatchBaseline({ appRoot, slug, actual });

  const result = validateFixture(appRoot, baseline);

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.approvedLegacySlugMismatch, 1);
});

test('slug legacy file을 변경하면 baseline 불일치로 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  const actual = '2026-08-28-legacy-example';
  writePair({ appRoot, slug, translationSlug: actual });
  const baseline = slugMismatchBaseline({ appRoot, slug, actual });
  fs.appendFileSync(path.join(appRoot, `src/mdx/${slug}.en.mdx`), 'changed\n');

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) => error.includes('slug를 바로잡아야 합니다')),
    true,
  );
});

test('slug를 해결한 뒤 남은 baseline entry를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  const actual = '2026-08-28-legacy-example';
  writePair({ appRoot, slug, translationSlug: actual });
  const baseline = slugMismatchBaseline({ appRoot, slug, actual });
  writePair({ appRoot, slug });

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) => error.includes('stale entry')),
    true,
  );
});

test('baseline schema 누락을 거부한다', () => {
  const appRoot = createFixture();
  writePair({ appRoot, slug: '2026-08-28-example' });

  const result = validateFixture(appRoot, {
    schemaVersion: 1,
    missingSourceHash: [],
  });

  assert.equal(
    result.errors.some((error) => error.includes('key만 가져야 합니다')),
    true,
  );
});

test('baseline의 잘못된 hash를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });
  baseline.missingSourceHash[0].sourceFileHash = 'invalid';

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) => error.includes('hash 형식')),
    true,
  );
});

test('baseline의 저장소 밖 경로를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });
  baseline.missingSourceHash[0].sourcePath = '../outside.mdx';

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) => error.includes('유효하지 않습니다')),
    true,
  );
});

test('baseline의 중복 entry를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, withHash: false });
  const baseline = missingHashBaseline({ appRoot, slug });
  baseline.missingSourceHash.push({ ...baseline.missingSourceHash[0] });

  const result = validateFixture(appRoot, baseline);

  assert.equal(
    result.errors.some((error) => error.includes('중복됩니다')),
    true,
  );
});

test('baseline 파일이 없으면 거부한다', () => {
  const appRoot = createFixture();
  writePair({ appRoot, slug: '2026-08-28-example' });

  const result = validateContent({ appRoot, repoRoot: appRoot });

  assert.equal(
    result.errors.some((error) => error.includes('읽을 수 없습니다')),
    true,
  );
});

test('빈 tags를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, tags: '[]' });

  const result = validateFixture(appRoot, emptyBaseline());

  assert.equal(
    result.errors.some((error) => error.includes('tags는')),
    true,
  );
});

test('등록되지 않은 runtime component와 없는 asset을 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({
    appRoot,
    slug,
    thumbnail: '/post/missing.webp',
    body: '<MissingDemo />\n',
  });

  const result = validateFixture(appRoot, emptyBaseline());

  assert.equal(
    result.errors.some((error) => error.includes('<MissingDemo>')),
    true,
  );
  assert.equal(
    result.errors.some((error) => error.includes('/post/missing.webp')),
    true,
  );
});

test('locale pair가 빠지면 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug });
  fs.rmSync(path.join(appRoot, `src/mdx/${slug}.en.mdx`));

  const result = validateFixture(appRoot, emptyBaseline());

  assert.equal(
    result.errors.some((error) => error.includes('locale pair')),
    true,
  );
});
