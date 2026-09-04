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
import { parsePostListFilter } from '@/lib/post-query';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';

// 필터(?category/?q/?year)별 server prefetch를 위해 searchParams를 읽으므로
// 이 라우트는 의도적으로 dynamic이다(필터 URL도 SSR + 크롤 가능).
export const dynamic = 'force-dynamic';

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    year?: string | string[];
  }>;
}) {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';
  const filter = parsePostListFilter(await searchParams);

  return (
    <Container as="section" size="lg" className="relative min-h-[70vh]">
      <Suspense
        fallback={
          <div
            className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10"
            role="status"
            aria-busy="true"
          >
            <div className="space-y-3">
              <div className="skeleton-shimmer h-3 w-20 rounded-sm" />
              <div className="skeleton-shimmer h-7 w-12 rounded-sm" />
              <div className="skeleton-shimmer h-3 w-16 rounded-sm" />
            </div>
            <div className="space-y-4">
              <div className="skeleton-shimmer h-9 w-full max-w-xl rounded-sm" />
              <div className="skeleton-shimmer h-4 w-full max-w-md rounded-sm" />
              <div className="skeleton-shimmer mt-8 h-10 w-full rounded-sm" />
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border-rule grid gap-2 border-t py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6"
                >
                  <div className="skeleton-shimmer h-3 w-14 rounded-sm" />
                  <div className="skeleton-shimmer h-4 max-w-xl rounded-sm" />
                  <div className="skeleton-shimmer h-3 w-12 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <BlogListServer locale={safeLocale} filter={filter} />
      </Suspense>
    </Container>
  );
}
