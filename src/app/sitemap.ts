import fs from 'fs';
import matter from 'gray-matter';
import { MetadataRoute } from 'next';
import path from 'path';

const BASE_URL = 'https://www.joseph0926.com';
const POSTS_PER_SITEMAP = 50000;

type PostData = {
  slug: string;
  date?: string;
  updatedAt?: string;
  publishedAt?: string;
  tags?: string[];
  category?: string;
};

type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

async function getMDXPosts(): Promise<PostData[]> {
  const mdxDirectory = path.join(process.cwd(), 'src/mdx');

  try {
    const files = await fs.promises.readdir(mdxDirectory);

    const posts = await Promise.all(
      files
        .filter((file) => file.endsWith('.mdx'))
        .map(async (file) => {
          const filePath = path.join(mdxDirectory, file);
          const fileContent = await fs.promises.readFile(filePath, 'utf8');
          const { data } = matter(fileContent);

          const fileNameWithoutExt = file.replace('.mdx', '');
          const dateMatch = fileNameWithoutExt.match(
            /^(\d{4}-\d{2}-\d{2})-(.+)$/,
          );

          let slug = fileNameWithoutExt;
          let fileDate = null;

          if (dateMatch) {
            fileDate = dateMatch[1];
            slug = dateMatch[2];
          }

          return {
            slug,
            date: data.date || data.publishedAt || fileDate,
            updatedAt: data.updatedAt,
            publishedAt: data.publishedAt || data.date || fileDate,
            tags: data.tags,
            category: data.category,
          };
        }),
    );

    return posts.filter(Boolean);
  } catch (error) {
    console.error('Error reading MDX files:', error);
    return [];
  }
}

function calculatePriority(
  pageType: string,
  lastModified?: Date | string,
): number {
  const basePriority: Record<string, number> = {
    home: 1.0,
    blog: 0.9,
    about: 0.8,
    post: 0.7,
    report: 0.3,
    admin: 0.1,
  };

  let priority = basePriority[pageType] || 0.5;

  if (lastModified && pageType === 'post') {
    const date = new Date(lastModified);
    const daysSinceUpdate = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceUpdate < 7) {
      priority = Math.min(1.0, priority + 0.2);
    } else if (daysSinceUpdate < 30) {
      priority = Math.min(1.0, priority + 0.1);
    } else if (daysSinceUpdate > 365) {
      priority = Math.max(0.3, priority - 0.2);
    }
  }

  return Number(priority.toFixed(1));
}

function getChangeFrequency(
  pageType: string,
  lastModified?: Date | string,
): ChangeFrequency {
  if (pageType === 'home' || pageType === 'blog') {
    return 'daily';
  }

  if (pageType === 'admin') {
    return 'monthly';
  }

  if (pageType === 'post' && lastModified) {
    const date = new Date(lastModified);
    const daysSinceUpdate = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceUpdate < 7) return 'daily';
    if (daysSinceUpdate < 30) return 'weekly';
    if (daysSinceUpdate < 90) return 'monthly';
    return 'yearly';
  }

  return 'weekly';
}

export async function generateSitemaps() {
  const posts = await getMDXPosts();
  const totalPosts = posts.length;

  if (totalPosts <= POSTS_PER_SITEMAP) {
    return [{ id: 0 }];
  }

  const numberOfSitemaps = Math.ceil(totalPosts / POSTS_PER_SITEMAP);
  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id = 0,
}: {
  id?: number;
} = {}): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: calculatePriority('about'),
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: calculatePriority('blog'),
    },
    {
      url: `${BASE_URL}/report`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: calculatePriority('report'),
    },
    {
      url: `${BASE_URL}/report/history`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: calculatePriority('report'),
    },
  ];

  const adminRoute: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
  ];

  const posts = await getMDXPosts();

  const start = id * POSTS_PER_SITEMAP;
  const end = start + POSTS_PER_SITEMAP;
  const paginatedPosts = posts.slice(start, end);

  const postRoutes: MetadataRoute.Sitemap = paginatedPosts.map((post) => {
    const lastModified = post.updatedAt || post.publishedAt || new Date();
    const postUrl = `${BASE_URL}/post/${post.slug}`;

    return {
      url: postUrl,
      lastModified: new Date(lastModified),
      changeFrequency: getChangeFrequency('post', lastModified),
      priority: calculatePriority('post', lastModified),
    };
  });

  if (id === 0) {
    const allRoutes = [...staticRoutes, ...adminRoute, ...postRoutes];

    const uniqueRoutes = Array.from(
      new Map(allRoutes.map((route) => [route.url, route])).values(),
    ).sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return uniqueRoutes;
  }

  return postRoutes.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

export async function generateSitemapIndex(): Promise<string> {
  const sitemaps = await generateSitemaps();

  if (sitemaps.length <= 1) {
    return '';
  }

  const sitemapUrls = sitemaps.map(({ id }) => `${BASE_URL}/sitemap/${id}.xml`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrls
    .map(
      (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`,
    )
    .join('')}
</sitemapindex>`;
}
