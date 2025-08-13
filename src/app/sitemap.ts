import fs from 'fs';
import matter from 'gray-matter';
import { MetadataRoute } from 'next';
import path from 'path';

const BASE_URL = 'https://joseph0926.com';

type PostData = {
  slug: string;
  date?: string;
  updatedAt?: string;
  publishedAt?: string;
};

async function getMDXPosts(): Promise<PostData[]> {
  const mdxDirectory = path.join(process.cwd(), 'src/mdx');

  try {
    const files = fs.readdirSync(mdxDirectory);

    const posts = files
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => {
        const filePath = path.join(mdxDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
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
        };
      })
      .filter((post) => post !== null);

    return posts;
  } catch (error) {
    console.error('Error reading MDX files:', error);
    return [];
  }
}

function calculatePriority(
  pageType: string,
  lastModified?: Date | string,
): number {
  const basePrority: Record<string, number> = {
    home: 1.0,
    blog: 0.9,
    about: 0.8,
    post: 0.7,
    report: 0.3,
  };

  let priority = basePrority[pageType] || 0.5;

  if (lastModified) {
    const date = new Date(lastModified);
    const daysSinceUpdate = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceUpdate < 7) {
      priority = Math.min(1.0, priority + 0.1);
    } else if (daysSinceUpdate < 30) {
      priority = Math.min(1.0, priority + 0.05);
    }
  }

  return Number(priority.toFixed(1));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.1,
    },
    {
      url: `${BASE_URL}/report`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/report/history`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.3,
    },
  ];

  const posts = await getMDXPosts();

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const lastModified = post.updatedAt || post.publishedAt || new Date();

    return {
      url: `${BASE_URL}/post/${post.slug}`,
      lastModified: new Date(lastModified),
      changeFrequency: 'monthly',
      priority: calculatePriority('post', lastModified),
    };
  });

  const allRoutes = [...staticRoutes, ...postRoutes];

  const uniqueRoutes = Array.from(
    new Map(allRoutes.map((route) => [route.url, route])).values(),
  ).sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return uniqueRoutes;
}

export async function generateSitemaps() {
  const posts = await getMDXPosts();
  const totalPosts = posts.length;
  const postsPerSitemap = 1000;

  if (totalPosts <= postsPerSitemap) {
    return [{ id: 0 }];
  }

  const numberOfSitemaps = Math.ceil(totalPosts / postsPerSitemap);
  return Array.from({ length: numberOfSitemaps }, (_, i) => ({ id: i }));
}
