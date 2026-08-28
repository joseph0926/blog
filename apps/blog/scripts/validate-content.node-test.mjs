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
  tags,
  thumbnail,
  body = '<Demo />\n',
  withHash = true,
}) => {
  const korean = `${frontmatter({ slug, tags, thumbnail })}${body}`;
  const english = `${frontmatter({
    slug,
    tags,
    thumbnail,
    sourceHash: withHash ? hash(korean) : undefined,
  })}${body}`;
  fs.writeFileSync(path.join(appRoot, `src/mdx/${slug}.mdx`), korean);
  fs.writeFileSync(path.join(appRoot, `src/mdx/${slug}.en.mdx`), english);
};

afterEach(() => {
  for (const tempRoot of tempRoots.splice(0)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('현재 hash를 가진 locale pair를 허용한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug });

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [`src/mdx/${slug}.mdx`, `src/mdx/${slug}.en.mdx`],
  });

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

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [`src/mdx/${slug}.mdx`, `src/mdx/${slug}.en.mdx`],
  });

  assert.equal(
    result.errors.some((error) => error.includes('현재 원문과 다릅니다')),
    true,
  );
});

test('원문만 변경하면 번역본 동기화를 요구한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug });

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [`src/mdx/${slug}.mdx`],
  });

  assert.equal(
    result.errors.some((error) => error.includes('같은 작업에서 변경')),
    true,
  );
});

test('손대지 않은 hash 없는 번역본은 legacy 경고로 허용한다', () => {
  const appRoot = createFixture();
  writePair({ appRoot, slug: '2026-08-28-example', withHash: false });

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [],
  });

  assert.deepEqual(result.errors, []);
  assert.equal(
    result.warnings.some((warning) => warning.includes('legacy')),
    true,
  );
});

test('빈 tags를 거부한다', () => {
  const appRoot = createFixture();
  const slug = '2026-08-28-example';
  writePair({ appRoot, slug, tags: '[]' });

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [`src/mdx/${slug}.mdx`, `src/mdx/${slug}.en.mdx`],
  });

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

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [`src/mdx/${slug}.mdx`, `src/mdx/${slug}.en.mdx`],
  });

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

  const result = validateContent({
    appRoot,
    repoRoot: appRoot,
    changedPaths: [`src/mdx/${slug}.mdx`, `src/mdx/${slug}.en.mdx`],
  });

  assert.equal(
    result.errors.some((error) => error.includes('locale pair')),
    true,
  );
});
