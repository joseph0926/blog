import matter from 'gray-matter';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SOURCE_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_FIELDS = ['slug', 'title', 'description', 'date', 'tags'];
const BASELINE_KEYS = ['missingSourceHash', 'schemaVersion', 'slugMismatch'];
const MISSING_HASH_KEYS = [
  'sourceFileHash',
  'sourcePath',
  'translationFileHash',
  'translationPath',
];
const SLUG_MISMATCH_KEYS = ['actual', 'expected', 'fileHash', 'path'];

const toPosix = (value) => value.split(path.sep).join('/');

const getSlugVariant = (fileName) => {
  if (fileName.endsWith('.en.mdx')) {
    return { slug: fileName.slice(0, -'.en.mdx'.length), locale: 'en' };
  }

  if (fileName.endsWith('.mdx')) {
    return { slug: fileName.slice(0, -'.mdx'.length), locale: 'ko' };
  }

  return null;
};

const contentHash = (value) =>
  `sha256:${createHash('sha256').update(value).digest('hex')}`;

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hasExactKeys = (value, expectedKeys) =>
  isPlainObject(value) &&
  JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expectedKeys);

const isSafeMdxPath = (value) =>
  typeof value === 'string' &&
  value.length > 0 &&
  !path.isAbsolute(value) &&
  !value.includes('\\') &&
  !value.split('/').includes('..') &&
  value.endsWith('.mdx');

const parseLegacyBaseline = (value, errors) => {
  const missingSourceHash = new Map();
  const slugMismatch = new Map();

  if (!hasExactKeys(value, BASELINE_KEYS)) {
    errors.push(
      `legacy baseline은 ${BASELINE_KEYS.join(', ')} key만 가져야 합니다.`,
    );
    return { missingSourceHash, slugMismatch };
  }

  if (value.schemaVersion !== 1) {
    errors.push('legacy baseline schemaVersion은 1이어야 합니다.');
  }

  if (!Array.isArray(value.missingSourceHash)) {
    errors.push('legacy baseline missingSourceHash는 배열이어야 합니다.');
  } else {
    const paths = [];

    value.missingSourceHash.forEach((entry, index) => {
      const label = `legacy baseline missingSourceHash[${index}]`;
      if (!hasExactKeys(entry, MISSING_HASH_KEYS)) {
        errors.push(`${label}의 field가 schema와 다릅니다.`);
        return;
      }

      const validPaths =
        isSafeMdxPath(entry.sourcePath) &&
        !entry.sourcePath.endsWith('.en.mdx') &&
        isSafeMdxPath(entry.translationPath) &&
        entry.translationPath.endsWith('.en.mdx') &&
        entry.translationPath === entry.sourcePath.replace(/\.mdx$/, '.en.mdx');
      const validHashes =
        typeof entry.sourceFileHash === 'string' &&
        SOURCE_HASH_PATTERN.test(entry.sourceFileHash) &&
        typeof entry.translationFileHash === 'string' &&
        SOURCE_HASH_PATTERN.test(entry.translationFileHash);

      if (!validPaths) {
        errors.push(
          `${label}의 sourcePath와 translationPath가 유효하지 않습니다.`,
        );
        return;
      }

      if (!validHashes) {
        errors.push(`${label}의 file hash 형식이 유효하지 않습니다.`);
        return;
      }

      if (missingSourceHash.has(entry.translationPath)) {
        errors.push(`${label}의 translationPath가 중복됩니다.`);
        return;
      }

      paths.push(entry.translationPath);
      missingSourceHash.set(entry.translationPath, entry);
    });

    if (JSON.stringify(paths) !== JSON.stringify([...paths].sort())) {
      errors.push(
        'legacy baseline missingSourceHash는 translationPath순이어야 합니다.',
      );
    }
  }

  if (!Array.isArray(value.slugMismatch)) {
    errors.push('legacy baseline slugMismatch는 배열이어야 합니다.');
  } else {
    const paths = [];

    value.slugMismatch.forEach((entry, index) => {
      const label = `legacy baseline slugMismatch[${index}]`;
      if (!hasExactKeys(entry, SLUG_MISMATCH_KEYS)) {
        errors.push(`${label}의 field가 schema와 다릅니다.`);
        return;
      }

      if (!isSafeMdxPath(entry.path)) {
        errors.push(`${label}의 path가 유효하지 않습니다.`);
        return;
      }

      if (
        typeof entry.fileHash !== 'string' ||
        !SOURCE_HASH_PATTERN.test(entry.fileHash)
      ) {
        errors.push(`${label}의 fileHash 형식이 유효하지 않습니다.`);
        return;
      }

      if (
        typeof entry.expected !== 'string' ||
        entry.expected.length === 0 ||
        typeof entry.actual !== 'string' ||
        entry.actual.length === 0
      ) {
        errors.push(`${label}의 expected와 actual이 유효하지 않습니다.`);
        return;
      }

      if (slugMismatch.has(entry.path)) {
        errors.push(`${label}의 path가 중복됩니다.`);
        return;
      }

      paths.push(entry.path);
      slugMismatch.set(entry.path, entry);
    });

    if (JSON.stringify(paths) !== JSON.stringify([...paths].sort())) {
      errors.push('legacy baseline slugMismatch는 path순이어야 합니다.');
    }
  }

  return { missingSourceHash, slugMismatch };
};

const stripCodeExamples = (content) =>
  content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]+`/g, '');

const addAbsoluteAssetReferences = (content, references) => {
  for (const match of content.matchAll(
    /!\[[^\]]*\]\((\/[^)\s]+)(?:\s+[^)]*)?\)/g,
  )) {
    references.add(match[1]);
  }

  for (const match of content.matchAll(
    /\bsrc=(?:["'`](\/[^"'`]+)["'`]|\{["'`](\/[^"'`]+)["'`]\})/g,
  )) {
    references.add(match[1] ?? match[2]);
  }
};

export function validateContent({
  appRoot,
  repoRoot = path.resolve(appRoot, '../..'),
  legacyBaseline,
}) {
  const mdxDir = path.join(appRoot, 'src/mdx');
  const publicDir = path.join(appRoot, 'public');
  const registryPath = path.join(mdxDir, 'component-registry.ts');
  const errors = [];
  const warnings = [];
  let baselineValue = legacyBaseline;

  if (baselineValue === undefined) {
    const baselinePath = path.join(
      appRoot,
      'scripts/content-legacy-baseline.json',
    );

    try {
      baselineValue = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    } catch (error) {
      errors.push(
        `legacy baseline '${toPosix(path.relative(repoRoot, baselinePath))}'을 읽을 수 없습니다: ${error.message}`,
      );
      baselineValue = {};
    }
  }

  const baseline = parseLegacyBaseline(baselineValue, errors);
  const variants = new Map();
  const records = new Map();
  const usedComponents = new Set();
  const assetReferences = new Set();
  const legacyHashes = [];
  const legacySlugs = [];
  const observedLegacyHashes = new Set();
  const observedLegacySlugs = new Set();
  const files = fs
    .readdirSync(mdxDir)
    .filter((fileName) => fileName.endsWith('.mdx'))
    .sort();
  const registrySource = fs.readFileSync(registryPath, 'utf8');
  const registeredComponents = new Set(
    [...registrySource.matchAll(/^  ([A-Z][A-Za-z0-9_]*):/gm)].map(
      (match) => match[1],
    ),
  );

  for (const fileName of files) {
    const variant = getSlugVariant(fileName);
    const filePath = path.join(mdxDir, fileName);
    const repoPath = toPosix(path.relative(repoRoot, filePath));
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(raw);
    const prose = stripCodeExamples(parsed.content);
    const entry = variants.get(variant.slug) ?? {};

    entry[variant.locale] = fileName;
    variants.set(variant.slug, entry);
    records.set(fileName, {
      ...variant,
      fileName,
      repoPath,
      raw,
      parsed,
    });

    for (const field of REQUIRED_FIELDS) {
      if (!(field in parsed.data)) {
        errors.push(`${repoPath}: frontmatter field '${field}'가 없습니다.`);
      }
    }

    if (typeof parsed.data.title !== 'string' || !parsed.data.title.trim()) {
      errors.push(`${repoPath}: title은 비어 있지 않은 문자열이어야 합니다.`);
    }

    if (
      typeof parsed.data.description !== 'string' ||
      !parsed.data.description.trim()
    ) {
      errors.push(
        `${repoPath}: description은 비어 있지 않은 문자열이어야 합니다.`,
      );
    }

    if (
      typeof parsed.data.date !== 'string' ||
      !DATE_PATTERN.test(parsed.data.date)
    ) {
      errors.push(`${repoPath}: date는 YYYY-MM-DD 문자열이어야 합니다.`);
    }

    if (
      !Array.isArray(parsed.data.tags) ||
      parsed.data.tags.length === 0 ||
      parsed.data.tags.some(
        (tag) => typeof tag !== 'string' || tag.trim().length === 0,
      )
    ) {
      errors.push(`${repoPath}: tags는 빈 값이 없는 문자열 배열이어야 합니다.`);
    }

    if (parsed.data.slug !== variant.slug) {
      const message = `${repoPath}: slug '${String(parsed.data.slug)}'가 파일명 '${variant.slug}'와 다릅니다.`;
      const entry = baseline.slugMismatch.get(repoPath);
      observedLegacySlugs.add(repoPath);

      if (
        entry &&
        entry.fileHash === contentHash(raw) &&
        entry.expected === variant.slug &&
        entry.actual === String(parsed.data.slug)
      ) {
        legacySlugs.push(message);
      } else {
        errors.push(
          `${message} 승인된 legacy baseline과 일치하지 않으므로 slug를 바로잡아야 합니다.`,
        );
      }
    }

    if (parsed.data.thumbnail !== undefined) {
      if (
        typeof parsed.data.thumbnail !== 'string' ||
        !parsed.data.thumbnail.startsWith('/')
      ) {
        errors.push(
          `${repoPath}: thumbnail은 /로 시작하는 문자열이어야 합니다.`,
        );
      } else {
        assetReferences.add(parsed.data.thumbnail);
      }
    }

    for (const match of prose.matchAll(/<([A-Z][A-Za-z0-9_]*)\b/g)) {
      usedComponents.add(match[1]);
    }
    addAbsoluteAssetReferences(prose, assetReferences);
  }

  for (const [slug, entry] of variants) {
    if (!entry.ko || !entry.en) {
      errors.push(`${slug}: 한국어와 영어 MDX locale pair가 모두 필요합니다.`);
      continue;
    }

    const korean = records.get(entry.ko);
    const english = records.get(entry.en);
    const expectedHash = contentHash(korean.raw);
    const actualHash = english.parsed.data.sourceHash;

    if (actualHash === undefined) {
      const entry = baseline.missingSourceHash.get(english.repoPath);
      observedLegacyHashes.add(english.repoPath);

      if (
        entry &&
        entry.sourcePath === korean.repoPath &&
        entry.sourceFileHash === contentHash(korean.raw) &&
        entry.translationFileHash === contentHash(english.raw)
      ) {
        legacyHashes.push(english.repoPath);
      } else {
        errors.push(
          `${english.repoPath}: sourceHash 누락이 승인된 legacy baseline과 일치하지 않습니다. 번역과 최종 검수를 마친 뒤 sourceHash '${expectedHash}'를 기록해야 합니다.`,
        );
      }
      continue;
    }

    if (
      typeof actualHash !== 'string' ||
      !SOURCE_HASH_PATTERN.test(actualHash)
    ) {
      errors.push(
        `${english.repoPath}: sourceHash는 sha256:<64 lowercase hex> 형식이어야 합니다.`,
      );
      continue;
    }

    if (actualHash !== expectedHash) {
      errors.push(
        `${english.repoPath}: sourceHash가 현재 원문과 다릅니다. expected '${expectedHash}'`,
      );
    }
  }

  for (const component of [...usedComponents].sort()) {
    if (!registeredComponents.has(component)) {
      errors.push(
        `src/mdx: runtime component <${component}>가 component-registry.ts에 없습니다.`,
      );
    }
  }

  for (const reference of [...assetReferences].sort()) {
    const assetPath = path.join(publicDir, reference.slice(1));
    if (!fs.existsSync(assetPath)) {
      errors.push(`public asset '${reference}'를 찾을 수 없습니다.`);
    }
  }

  for (const translationPath of baseline.missingSourceHash.keys()) {
    if (!observedLegacyHashes.has(translationPath)) {
      errors.push(
        `legacy baseline missingSourceHash '${translationPath}'가 현재 violation과 일치하지 않습니다. stale entry를 제거해야 합니다.`,
      );
    }
  }

  for (const repoPath of baseline.slugMismatch.keys()) {
    if (!observedLegacySlugs.has(repoPath)) {
      errors.push(
        `legacy baseline slugMismatch '${repoPath}'가 현재 violation과 일치하지 않습니다. stale entry를 제거해야 합니다.`,
      );
    }
  }

  if (legacyHashes.length > 0) {
    warnings.push(
      `sourceHash가 없는 approved legacy baseline 영어 번역본 ${legacyHashes.length}개`,
    );
  }

  if (legacySlugs.length > 0) {
    warnings.push(
      `파일명과 slug가 다른 approved legacy baseline MDX ${legacySlugs.length}개: ${legacySlugs.join(' | ')}`,
    );
  }

  return {
    errors,
    warnings,
    summary: {
      posts: variants.size,
      files: records.size,
      approvedLegacyMissingSourceHash: legacyHashes.length,
      approvedLegacySlugMismatch: legacySlugs.length,
      registeredComponents: registeredComponents.size,
    },
  };
}

const usage = `Usage: node scripts/validate-content.mjs

Validates the full MDX corpus, legacy baseline, locale pairs, sourceHash, public assets and runtime components.
The command never modifies content.`;

function run() {
  const { values } = parseArgs({
    options: {
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: false,
  });

  if (values.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }

  const appRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const result = validateContent({ appRoot });

  process.stdout.write(
    `Content validation: ${result.summary.posts} posts, ${result.summary.files} files, ${result.summary.approvedLegacyMissingSourceHash} approved legacy missing sourceHash, ${result.summary.approvedLegacySlugMismatch} approved legacy slug mismatch\n`,
  );
  result.warnings.forEach((warning) =>
    process.stderr.write(`WARNING ${warning}\n`),
  );
  result.errors.forEach((error) => process.stderr.write(`ERROR ${error}\n`));

  if (result.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  process.stdout.write('Content validation passed.\n');
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run();
}
