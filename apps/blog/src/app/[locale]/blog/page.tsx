import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { BlogListServer } from '@/components/blog/blog-list.server';
import { Container } from '@/components/ui/container';
import { isAppLocale } from '@/i18n/routing';
import {
  getAlternates,
  getOpenGraphLocale,
  localizedPath,
  toAbsoluteUrl,
} from '@/i18n/seo';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';

export const dynamic = 'force-static';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';
  const t = await getTranslations({ locale: safeLocale, namespace: 'meta' });

  return {
    title: 'Blog',
    description: t('blogDescription'),
    keywords:
      safeLocale === 'ko'
        ? [
            '기술 블로그',
            '프론트엔드 개발',
            'React 블로그',
            'TypeScript 블로그',
            'Next.js 튜토리얼',
            '웹 개발 블로그',
            '김영훈 블로그',
            'joseph0926',
          ]
        : [
            'technical blog',
            'frontend engineering',
            'React blog',
            'TypeScript blog',
            'Next.js blog',
            'web performance',
            'joseph0926',
          ],
    alternates: getAlternates(safeLocale, '/blog'),
    openGraph: {
      ...commonOpenGraph,
      title: t('blogTitle'),
      description: t('blogDescription'),
      url: toAbsoluteUrl(localizedPath(safeLocale, '/blog')),
      type: 'website',
      locale: getOpenGraphLocale(safeLocale),
      images: [
        {
          url: 'https://www.joseph0926.com/logo/logo.webp',
          width: 1200,
          height: 630,
          alt:
            safeLocale === 'ko'
              ? '김영훈 기술 블로그'
              : 'Younghoon Kim frontend engineering blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('blogTitle'),
      description: t('blogDescription'),
      images: ['/logo/logo.webp'],
    },
    robots: pageRobots.blogList,
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';

  return (
    <Container as="section" size="lg" className="relative min-h-[70vh]">
      <Suspense
        fallback={
          <div className="space-y-8 py-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,520px)]">
              <div className="space-y-4">
                <div className="bg-muted h-12 w-full max-w-xl rounded-md" />
                <div className="bg-muted h-4 w-full max-w-md rounded-md" />
              </div>
              <div className="bg-muted h-12 rounded-md" />
            </div>
            <div className="grid gap-0 border-y md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="border-border/70 space-y-3 p-6">
                  <div className="bg-muted h-8 w-8 rounded-md" />
                  <div className="bg-muted h-5 w-28 rounded-md" />
                  <div className="bg-muted h-4 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <BlogListServer locale={safeLocale} />
      </Suspense>
    </Container>
  );
}
