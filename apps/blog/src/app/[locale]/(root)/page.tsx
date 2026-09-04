import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { AllBlogPosts } from '@/components/home/all-blog-posts';
import { HeroSection } from '@/components/home/hero-section';
import { RecentBlogPosts } from '@/components/home/recent-blog-posts';
import { AllBlogPostsLoading } from '@/components/loading/all-blog-posts.loading';
import { RecentBlogPostsLoading } from '@/components/loading/recent-blog-posts.loading';
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
    title: { absolute: t('homeTitle') },
    description: t('homeDescription'),
    alternates: getAlternates(safeLocale, '/'),
    openGraph: {
      ...commonOpenGraph,
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: toAbsoluteUrl(localizedPath(safeLocale, '/')),
      locale: getOpenGraphLocale(safeLocale),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('homeTitle'),
      description: t('homeDescription'),
      images: ['/logo/logo.webp'],
    },
    robots: pageRobots.home,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';
  const t = await getTranslations({ locale: safeLocale, namespace: 'home' });

  return (
    <>
      <HeroSection locale={safeLocale} />
      <Container as="div" size="lg" className="space-y-16 py-12 sm:py-16">
        <section
          id="latest"
          className="grid scroll-mt-20 gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10"
          aria-labelledby="latest-heading"
        >
          <p className="text-muted-foreground text-xs">
            {t('sectionRecentTitle')}
          </p>
          <div>
            <h2
              id="latest-heading"
              className="text-foreground mb-2 text-xl font-semibold tracking-tight"
            >
              {t('sectionRecentDescription')}
            </h2>
            <Suspense fallback={<RecentBlogPostsLoading />}>
              <RecentBlogPosts locale={safeLocale} />
            </Suspense>
          </div>
        </section>
        <section aria-labelledby="archive-heading">
          <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
            <p className="text-muted-foreground text-xs">
              {t('sectionArchiveTitle')}
            </p>
            <h2
              id="archive-heading"
              className="text-foreground mb-2 text-xl font-semibold tracking-tight"
            >
              {t('sectionArchiveDescription')}
            </h2>
          </div>
          <Suspense fallback={<AllBlogPostsLoading />}>
            <AllBlogPosts locale={safeLocale} />
          </Suspense>
        </section>
      </Container>
    </>
  );
}
