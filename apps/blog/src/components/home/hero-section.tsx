import { ArrowDown, ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import type { PostResponse } from '@/types/post.type';
import { formatEntryNumber, formatPostDate, formatReadTime } from './blog-post';

type HeroSectionProps = {
  locale: AppLocale;
};

const inkLink =
  'press text-accent-ink hover:text-accent-ink-hover focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm text-sm font-medium underline decoration-accent-ink/40 decoration-1 underline-offset-[6px] transition-colors duration-150 hover:decoration-accent-ink-hover focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none';

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let featuredPost: PostResponse | null = null;
  let totalCount = 0;
  let hasError = false;

  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 1, locale });

    featuredPost = result.posts[0] ?? null;
    totalCount = result.totalCount;
  } catch {
    hasError = true;
  }

  return (
    <section className="border-rule border-b">
      <div className="mx-auto grid max-w-[1260px] gap-6 px-4 py-12 sm:py-16 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10 lg:py-20">
        <div className="text-muted-foreground flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-xs tabular-nums lg:flex-col lg:gap-2">
          <p className="relative pb-2 font-sans">
            {t('latestEssay')}
            <span
              aria-hidden="true"
              className="bg-accent-ink motion-safe:animate-rule-in absolute bottom-0 left-0 h-px w-8 origin-left"
            />
          </p>
          {featuredPost && (
            <>
              <p className="text-foreground motion-safe:animate-ink-settle text-2xl lg:mt-1 lg:text-3xl">
                {formatEntryNumber(totalCount)}
              </p>
              <time dateTime={new Date(featuredPost.createdAt).toISOString()}>
                {formatPostDate(featuredPost.createdAt, locale)}
              </time>
            </>
          )}
        </div>
        <div className="max-w-[68ch]">
          <h1 className="text-foreground text-[2rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
            {featuredPost?.title ?? t('headlineTop')}
          </h1>
          <p className="text-muted-foreground mt-5 text-base leading-7 sm:text-lg sm:leading-8">
            {featuredPost?.description ?? t('description')}
          </p>
          {featuredPost && (
            <p className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-mono text-xs tabular-nums">
                {formatReadTime(featuredPost.readingTime, locale)}
              </span>
              {featuredPost.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="flex items-center gap-3">
                  <span aria-hidden="true" className="bg-rule h-3 w-px" />
                  {tag.name}
                </span>
              ))}
            </p>
          )}
          {hasError && (
            <p className="border-rule text-muted-foreground mt-6 border-l-2 pl-4 text-sm">
              {t('loadPostsError')}
            </p>
          )}
          {!featuredPost && !hasError && (
            <p className="border-rule text-muted-foreground mt-6 border-l-2 pl-4 text-sm">
              {t('emptyRecentPosts')}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {featuredPost && (
              <Link href={`/post/${featuredPost.slug}`} className={inkLink}>
                {t('readEssay')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <a
              href="#latest"
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
            >
              {t('latestPosts')}
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
