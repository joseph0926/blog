import { MetadataRoute } from 'next';
import { appLocales } from '@/i18n/routing';
import { localizedPath, toAbsoluteUrl } from '@/i18n/seo';
import { getAllPostSlugs, getPostMetaBySlug } from '@/services/post.service';

type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

const languageAlternates = (path: string) => ({
  languages: {
    ko: toAbsoluteUrl(localizedPath('ko', path)),
    en: toAbsoluteUrl(localizedPath('en', path)),
  },
});

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

const buildLocalizedStaticRoutes = () => {
  const routes = [
    { path: '/', type: 'home', frequency: 'daily' as ChangeFrequency },
    { path: '/about', type: 'about', frequency: 'monthly' as ChangeFrequency },
    { path: '/blog', type: 'blog', frequency: 'daily' as ChangeFrequency },
  ];

  return routes.flatMap((route) =>
    appLocales.map((locale) => ({
      url: toAbsoluteUrl(localizedPath(locale, route.path)),
      lastModified: new Date(),
      changeFrequency: route.frequency,
      priority: calculatePriority(route.type),
      alternates: languageAlternates(route.path),
    })),
  );
};

const buildLocalizedPostRoutes = async (): Promise<MetadataRoute.Sitemap> => {
  const slugs = await getAllPostSlugs();

  const allPostRoutes = await Promise.all(
    slugs.map(async (slug) => {
      const koPost = await getPostMetaBySlug(slug, 'ko');
      if (!koPost) return [];

      const enPost = await getPostMetaBySlug(slug, 'en');
      const lastModified =
        enPost?.updatedAt ??
        koPost.updatedAt ??
        enPost?.date ??
        koPost.date ??
        new Date().toISOString();
      const path = `/post/${slug}`;

      return appLocales.map((locale) => ({
        url: toAbsoluteUrl(localizedPath(locale, path)),
        lastModified: new Date(lastModified),
        changeFrequency: getChangeFrequency('post', lastModified),
        priority: calculatePriority('post', lastModified),
        alternates: languageAlternates(path),
      }));
    }),
  );

  return allPostRoutes.flat();
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = buildLocalizedStaticRoutes();
  const postRoutes = await buildLocalizedPostRoutes();
  const allRoutes = [...staticRoutes, ...postRoutes];

  const uniqueRoutes = Array.from(
    new Map(allRoutes.map((route) => [route.url, route])).values(),
  ).sort((a, b) => (b.priority || 0) - (a.priority || 0));

  return uniqueRoutes;
}
