import 'server-only';
import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  thumbnail?: string | null;
  updatedAt?: string;
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
  createdAt: Date;
  tags: { id: string; name: string }[];
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

const normalizeMeta = (
  data: Record<string, unknown>,
  slug: string,
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
    thumbnail: typeof data.thumbnail === 'string' ? data.thumbnail : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  };
};

const toPostListItem = (meta: PostMeta): PostListItem => ({
  id: meta.slug,
  slug: meta.slug,
  title: meta.title,
  description: meta.description,
  thumbnail: meta.thumbnail ?? null,
  createdAt: new Date(meta.date),
  tags: meta.tags.map((tag) => ({ id: tag, name: tag })),
});

export const getPostContent = async (slug: string) => {
  const decodedSlug = decodeURIComponent(slug);
  const postPath = path.join(mdxDir, `${decodedSlug}.mdx`);
  const source = fs.readFileSync(postPath, 'utf-8');
  return { source };
};

export const getAllPostSlugs = async (): Promise<string[]> => {
  const files = fs.readdirSync(mdxDir);
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
};

const getAllPostMeta = async (): Promise<PostMeta[]> => {
  const files = await fs.promises.readdir(mdxDir);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.mdx'))
      .map(async (file) => {
        const filePath = path.join(mdxDir, file);
        const source = await fs.promises.readFile(filePath, 'utf-8');
        const { data } = matter(source);
        const slug = file.replace(/\.mdx$/, '');
        return normalizeMeta(data, slug);
      }),
  );

  return posts;
};

export const getAllPosts = async (): Promise<PostListItem[]> => {
  const metas = await getAllPostMeta();
  return metas.map(toPostListItem).sort((a, b) => {
    const diff = b.createdAt.getTime() - a.createdAt.getTime();
    if (diff !== 0) return diff;
    return b.slug.localeCompare(a.slug);
  });
};

export const getPostMetaBySlug = async (
  slug: string,
): Promise<PostMeta | null> => {
  const decodedSlug = decodeURIComponent(slug);
  const filePath = path.join(mdxDir, `${decodedSlug}.mdx`);

  try {
    const source = await fs.promises.readFile(filePath, 'utf-8');
    const { data } = matter(source);
    return normalizeMeta(data, decodedSlug);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

export const getPostBySlug = async (
  slug: string,
): Promise<PostListItem | null> => {
  const meta = await getPostMetaBySlug(slug);
  if (!meta) return null;
  return toPostListItem(meta);
};

export const getAllTags = async (): Promise<string[]> => {
  const metas = await getAllPostMeta();
  const tags = new Set<string>();
  metas.forEach((meta) => {
    meta.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
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

  const normalized = normalizeMeta(nextData, decodedSlug);
  return toPostListItem(normalized);
};
