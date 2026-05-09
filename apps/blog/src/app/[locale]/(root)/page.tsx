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
      <Container as="div" size="lg" className="space-y-20 py-16 sm:py-20">
        <section id="latest" className="scroll-mt-24">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground font-mono text-xs font-medium">
                {t('sectionRecentTitle')}
              </p>
              <h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {t('sectionRecentDescription')}
              </h2>
            </div>
          </div>
          <Suspense fallback={<RecentBlogPostsLoading />}>
            <RecentBlogPosts locale={safeLocale} />
          </Suspense>
        </section>
        <section>
          <div className="mb-7">
            <p className="text-muted-foreground font-mono text-xs font-medium">
              {t('sectionArchiveTitle')}
            </p>
            <h2 className="text-foreground mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
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
