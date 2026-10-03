import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { type DialPost, QuestionDial } from '@/components/home/question-dial';
import { Link } from '@/i18n/navigation';
import { isAppLocale } from '@/i18n/routing';
import {
  getAlternates,
  getOpenGraphLocale,
  localizedPath,
  toAbsoluteUrl,
} from '@/i18n/seo';
import { formatPostLongDate, formatReadTime } from '@/lib/post-format';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import type { PostResponse } from '@/types/post.type';

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

const DIAL_SIZE = 12;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';
  const t = await getTranslations({ locale: safeLocale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts: PostResponse[] | null = null;
  let totalCount = 0;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: DIAL_SIZE, locale: safeLocale });
    posts = result.posts;
    totalCount = result.totalCount;
  } catch {
    posts = null;
  }

  const dialPosts: DialPost[] = (posts ?? []).map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    year: new Date(post.createdAt).getFullYear().toString(),
    meta: [
      formatPostLongDate(post.createdAt, safeLocale),
      formatReadTime(post.readingTime, safeLocale),
      ...post.tags.slice(0, 2).map((tag) => tag.name),
    ].join(', '),
  }));

  return (
    <>
      <h1 className="sr-only">{t('headlineTop')}</h1>
      {posts === null && (
        <p className="text-muted-foreground mx-auto max-w-[1260px] px-4 py-24 text-sm">
          {t('loadPostsError')}
        </p>
      )}
      {posts !== null && dialPosts.length === 0 && (
        <p className="text-muted-foreground mx-auto max-w-[1260px] px-4 py-24 text-sm">
          {t('emptyRecentPosts')}
        </p>
      )}
      <QuestionDial
        posts={dialPosts}
        heading={t('dialHeading')}
        readLabel={t('readEssay')}
      />
      {dialPosts.length > 0 && (
        <div className="text-muted-foreground mx-auto flex max-w-[1260px] flex-col gap-3 px-4 pt-24 pb-32 text-[15px] sm:flex-row sm:justify-between">
          <p>{t('recentCount', { count: dialPosts.length })}</p>
          <Link
            href="/blog"
            className="text-foreground hover:text-accent-ink focus-visible:ring-ring rounded-sm font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            {t('findAll', { count: totalCount })}
          </Link>
        </div>
      )}
    </>
  );
}
