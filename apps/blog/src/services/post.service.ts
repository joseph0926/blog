import 'server-only';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import type { AppLocale } from '@/i18n/routing';
import { defaultLocale } from '@/i18n/routing';
import { perfTimer } from '@/lib/perf-log';

type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: number;
  thumbnail?: string | null;
  updatedAt?: string;
  resolvedLocale: AppLocale;
  isFallback: boolean;
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  readingTime: number;
  createdAt: Date;
  tags: { id: string; name: string }[];
  resolvedLocale: AppLocale;
  isFallback: boolean;
};

type VariantMapEntry = {
  slug: string;
  files: Partial<Record<AppLocale, string>>;
};

type ResolvedVariant = {
  fileName: string;
  resolvedLocale: AppLocale;
  isFallback: boolean;
};

const mdxDir = path.join(process.cwd(), 'src/mdx');

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag)).filter(Boolean);
  }
  if (typeof value === 'string') return [value];
  return [];
};

const getFileDate = (slug: string) => {
  const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})-/);
  return dateMatch ? dateMatch[1] : null;
};

const getReadingTimeFromMdx = (mdxContent: string) => {
  const wordsPerMinute = 200;
  const text = mdxContent
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_\-\[\](){}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return 1;

  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

const parseMdxFileName = (
  fileName: string,
): { slug: string; locale: AppLocale } | null => {
  if (!fileName.endsWith('.mdx')) return null;
  const withoutExt = fileName.replace(/\.mdx$/, '');

  if (withoutExt.endsWith('.en')) {
    return {
      slug: withoutExt.replace(/\.en$/, ''),
      locale: 'en',
    };
  }

  return {
    slug: withoutExt,
    locale: 'ko',
  };
};

const readVariantMap = async (): Promise<Map<string, VariantMapEntry>> => {
  const files = await fs.promises.readdir(mdxDir);
  const map = new Map<string, VariantMapEntry>();

  files.forEach((fileName) => {
    const parsed = parseMdxFileName(fileName);
    if (!parsed) return;

    const current = map.get(parsed.slug) ?? {
      slug: parsed.slug,
      files: {},
    };
    current.files[parsed.locale] = fileName;
    map.set(parsed.slug, current);
  });

  return map;
};

const resolveVariantForLocale = (
  variants: VariantMapEntry['files'],
  locale: AppLocale,
): ResolvedVariant | null => {
  if (locale === 'en') {
    if (variants.en) {
      return {
        fileName: variants.en,
        resolvedLocale: 'en',
        isFallback: false,
      };
    }
    if (variants.ko) {
      return {
        fileName: variants.ko,
        resolvedLocale: 'ko',
        isFallback: true,
      };
    }
    return null;
  }

  if (variants.ko) {
    return {
      fileName: variants.ko,
      resolvedLocale: 'ko',
      isFallback: false,
    };
  }

  return null;
};

const normalizeMeta = (
  data: Record<string, unknown>,
  slug: string,
  mdxContent: string,
  resolvedLocale: AppLocale,
  isFallback: boolean,
): PostMeta => {
  const fileDate = getFileDate(slug);
  const date =
    typeof data.date === 'string'
      ? data.date
      : typeof data.publishedAt === 'string'
        ? data.publishedAt
        : fileDate || new Date(0).toISOString().split('T')[0];

  return {
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    description: typeof data.description === 'string' ? data.description : '',
    date,
    tags: normalizeTags(data.tags),
    readingTime: getReadingTimeFromMdx(mdxContent),
    thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    resolvedLocale,
    isFallback,
  };
};

const toPostListItem = (meta: PostMeta): PostListItem => ({
  id: meta.slug,
  slug: meta.slug,
  title: meta.title,
  description: meta.description,
  thumbnail: meta.thumbnail ?? null,
  readingTime: meta.readingTime,
  createdAt: new Date(meta.date),
  tags: meta.tags.map((tag) => ({ id: tag, name: tag })),
  resolvedLocale: meta.resolvedLocale,
  isFallback: meta.isFallback,
});

const resolveSlugVariant = async ({
  slug,
  locale,
}: {
  slug: string;
  locale: AppLocale;
}): Promise<(ResolvedVariant & { filePath: string }) | null> => {
  const map = await readVariantMap();
  const entry = map.get(slug);
  if (!entry) return null;

  const resolved = resolveVariantForLocale(entry.files, locale);
  if (!resolved) return null;

  return {
    ...resolved,
    filePath: path.join(mdxDir, resolved.fileName),
  };
};

const sortByDateDesc = (a: PostListItem, b: PostListItem) => {
  const diff = b.createdAt.getTime() - a.createdAt.getTime();
  if (diff !== 0) return diff;
  return b.slug.localeCompare(a.slug);
};

export const getPostContent = async (
  slug: string,
  locale: AppLocale = defaultLocale,
) => {
  const end = perfTimer('mdx:getPostContent');
  const decodedSlug = decodeURIComponent(slug);
  const resolved = await resolveSlugVariant({ slug: decodedSlug, locale });

  if (!resolved) {
    end({ slug: decodedSlug, found: false, locale });
    throw new Error('Post not found');
  }

  const source = fs.readFileSync(resolved.filePath, 'utf-8');
  end({
    slug: decodedSlug,
    bytes: source.length,
    locale,
    resolvedLocale: resolved.resolvedLocale,
    isFallback: resolved.isFallback,
  });

  return {
    source,
    resolvedLocale: resolved.resolvedLocale,
    isFallback: resolved.isFallback,
  };
};

export const getAllPostSlugs = async (): Promise<string[]> => {
  const end = perfTimer('mdx:getAllPostSlugs');
  const map = await readVariantMap();
  const slugs = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
  end({ count: slugs.length });
  return slugs;
};

const getAllPostMeta = async (locale: AppLocale): Promise<PostMeta[]> => {
  const end = perfTimer('mdx:getAllPostMeta');
  const map = await readVariantMap();

  const entries = await Promise.all(
    [...map.values()].map(async (entry) => {
      const resolved = resolveVariantForLocale(entry.files, locale);
      if (!resolved) return null;

      const filePath = path.join(mdxDir, resolved.fileName);
      const source = await fs.promises.readFile(filePath, 'utf-8');
      const { data, content } = matter(source);

      return {
        meta: normalizeMeta(
          data,
          entry.slug,
          content,
          resolved.resolvedLocale,
          resolved.isFallback,
        ),
        bytes: source.length,
      };
    }),
  );

  const filtered = entries.filter(
    (entry): entry is { meta: PostMeta; bytes: number } => entry !== null,
  );
  const totalBytes = filtered.reduce((sum, entry) => sum + entry.bytes, 0);
  const posts = filtered.map((entry) => entry.meta);

  end({
    fileCount: filtered.length,
    count: posts.length,
    bytes: totalBytes,
    locale,
  });

  return posts;
};

export const getAllPosts = async (
  locale: AppLocale = defaultLocale,
): Promise<PostListItem[]> => {
  const end = perfTimer('mdx:getAllPosts');
  const metas = await getAllPostMeta(locale);
  const posts = metas.map(toPostListItem).sort(sortByDateDesc);
  end({ count: posts.length, locale });
  return posts;
};

export const getPostMetaBySlug = async (
  slug: string,
  locale: AppLocale = defaultLocale,
): Promise<PostMeta | null> => {
  const end = perfTimer('mdx:getPostMetaBySlug');
  const decodedSlug = decodeURIComponent(slug);
  const resolved = await resolveSlugVariant({ slug: decodedSlug, locale });

  if (!resolved) {
    end({ slug: decodedSlug, found: false, locale });
    return null;
  }

  try {
    const source = await fs.promises.readFile(resolved.filePath, 'utf-8');
    const { data, content } = matter(source);
    end({
      slug: decodedSlug,
      found: true,
      locale,
      resolvedLocale: resolved.resolvedLocale,
      isFallback: resolved.isFallback,
      bytes: source.length,
    });
    return normalizeMeta(
      data,
      decodedSlug,
      content,
      resolved.resolvedLocale,
      resolved.isFallback,
    );
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      end({ slug: decodedSlug, found: false, locale });
      return null;
    }

    end({ slug: decodedSlug, error: true, locale });
    throw error;
  }
};

export const getPostBySlug = async (
  slug: string,
  locale: AppLocale = defaultLocale,
): Promise<PostListItem | null> => {
  const meta = await getPostMetaBySlug(slug, locale);
  if (!meta) return null;
  return toPostListItem(meta);
};

export const getAllTags = async (
  locale: AppLocale = defaultLocale,
): Promise<string[]> => {
  const end = perfTimer('mdx:getAllTags');
  const metas = await getAllPostMeta(locale);
  const tags = new Set<string>();
  metas.forEach((meta) => {
    meta.tags.forEach((tag) => tags.add(tag));
  });
  const results = Array.from(tags).sort((a, b) => a.localeCompare(b));
  end({ count: results.length, locale });
  return results;
};

export const updatePostMeta = async ({
  slug,
  payload,
}: {
  slug: string;
  payload: {
    title: string;
    description: string;
    tags: string[];
    thumbnail?: string;
  };
}): Promise<PostListItem> => {
  const decodedSlug = decodeURIComponent(slug);
  const filePath = path.join(mdxDir, `${decodedSlug}.mdx`);

  const source = await fs.promises.readFile(filePath, 'utf-8');
  const { data, content } = matter(source);

  const nextData: Record<string, unknown> = {
    ...data,
    title: payload.title,
    description: payload.description,
    tags: payload.tags,
    updatedAt: new Date().toISOString(),
  };

  if (payload.thumbnail && payload.thumbnail.trim().length > 0) {
    nextData.thumbnail = payload.thumbnail;
  } else {
    delete nextData.thumbnail;
  }

  const nextSource = matter.stringify(content, nextData);
  await fs.promises.writeFile(filePath, nextSource);

  const normalized = normalizeMeta(nextData, decodedSlug, content, 'ko', false);
  return toPostListItem(normalized);
};
