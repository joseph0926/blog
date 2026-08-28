import matter from 'gray-matter';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const SOURCE_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_FIELDS = ['slug', 'title', 'description', 'date', 'tags'];

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

const sourceHash = (value) =>
  `sha256:${createHash('sha256').update(value).digest('hex')}`;

const stripCodeExamples = (content) =>
  content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]+`/g, '');

const readChangedPaths = (repoRoot) => {
  const commands = [
    ['diff', '--name-only', '--diff-filter=ACMRD', '--'],
    ['diff', '--cached', '--name-only', '--diff-filter=ACMRD', '--'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  const changed = new Set();

  for (const args of commands) {
    const output = execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    output
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => changed.add(entry));
  }

  return changed;
};

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
  changedPaths,
}) {
  const mdxDir = path.join(appRoot, 'src/mdx');
  const publicDir = path.join(appRoot, 'public');
  const registryPath = path.join(mdxDir, 'component-registry.ts');
  const changed = changedPaths
    ? new Set([...changedPaths].map(toPosix))
    : readChangedPaths(repoRoot);
  const errors = [];
  const warnings = [];
  const variants = new Map();
  const records = new Map();
  const usedComponents = new Set();
  const assetReferences = new Set();
  const legacyHashes = [];
  const legacySlugs = [];
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
    const isChanged = changed.has(repoPath);
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
      isChanged,
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
      if (isChanged) errors.push(message);
      else legacySlugs.push(message);
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
    const expectedHash = sourceHash(korean.raw);
    const actualHash = english.parsed.data.sourceHash;

    if (korean.isChanged && !english.isChanged) {
      errors.push(
        `${korean.repoPath}: 원문을 변경하면 ${english.repoPath}도 같은 작업에서 변경해야 합니다.`,
      );
    }

    if (actualHash === undefined) {
      if (korean.isChanged || english.isChanged) {
        errors.push(
          `${english.repoPath}: 변경된 번역본에는 sourceHash '${expectedHash}'가 필요합니다.`,
        );
      } else {
        legacyHashes.push(english.repoPath);
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

  if (legacyHashes.length > 0) {
    warnings.push(
      `sourceHash가 없는 untouched legacy 영어 번역본 ${legacyHashes.length}개`,
    );
  }

  if (legacySlugs.length > 0) {
    warnings.push(
      `파일명과 slug가 다른 untouched legacy MDX ${legacySlugs.length}개: ${legacySlugs.join(' | ')}`,
    );
  }

  return {
    errors,
    warnings,
    summary: {
      posts: variants.size,
      files: records.size,
      changedMdxFiles: [...records.values()].filter(
        (record) => record.isChanged,
      ).length,
      registeredComponents: registeredComponents.size,
    },
  };
}

const usage = `Usage: node scripts/validate-content.mjs

Validates MDX frontmatter, locale pairs, sourceHash, public assets and runtime components.
Changed files are detected from Git. The command never modifies content.`;

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
    `Content validation: ${result.summary.posts} posts, ${result.summary.files} files, ${result.summary.changedMdxFiles} changed MDX files\n`,
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
