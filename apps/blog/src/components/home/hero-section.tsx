import { ArrowDown, ArrowRight, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import type { PostResponse } from '@/types/post.type';
import { formatPostDate, formatReadTime } from './blog-post';

type HeroSectionProps = {
  locale: AppLocale;
};

const topics = ['React', 'TypeScript', 'Performance', 'Tooling'];

export async function HeroSection({ locale }: HeroSectionProps) {
  const t = await getTranslations({ locale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let featuredPost: PostResponse | null = null;
  let hasError = false;

  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 1, locale });

    featuredPost = result.posts[0] ?? null;
  } catch {
    hasError = true;
  }

  return (
    <section className="border-border/70 border-b">
      <div className="mx-auto grid max-w-[1260px] gap-12 px-4 py-14 sm:py-18 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,19rem)] lg:items-start lg:py-20">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-wide text-[#5e6ad2]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5e6ad2]" />
            {featuredPost ? t('latestEssay') : t('badge')}
          </p>
          <h1 className="text-foreground mt-5 text-4xl font-semibold tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            {featuredPost?.title ?? t('headlineTop')}
          </h1>
          <p className="text-muted-foreground mt-5 text-base leading-7 sm:text-lg">
            {featuredPost?.description ?? t('description')}
          </p>
          {featuredPost && (
            <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs tabular-nums">
              <time dateTime={new Date(featuredPost.createdAt).toISOString()}>
                {formatPostDate(featuredPost.createdAt, locale)}
              </time>
              <span aria-hidden="true">/</span>
              <span>{formatReadTime(featuredPost.readingTime, locale)}</span>
              {featuredPost.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="text-muted-foreground/80">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {hasError && (
            <p className="border-border/70 bg-muted/30 text-muted-foreground mt-6 rounded-md border px-4 py-3 text-sm">
              {t('loadPostsError')}
            </p>
          )}
          {!featuredPost && !hasError && (
            <p className="border-border/70 bg-muted/30 text-muted-foreground mt-6 rounded-md border px-4 py-3 text-sm">
              {t('emptyRecentPosts')}
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {featuredPost && (
              <Link
                href={`/post/${featuredPost.slug}`}
                className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-md bg-[#5e6ad2] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#828fff] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {t('readEssay')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <a
              href="#latest"
              className="focus-visible:ring-ring border-border text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t('latestPosts')}
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </div>

        <nav
          aria-label={t('labJumpTo')}
          className="border-border/70 bg-card/40 rounded-xl border lg:mt-1.5"
        >
          <Link
            href="/blog"
            className="focus-visible:ring-ring group border-border/70 hover:bg-muted/40 flex items-center gap-3 border-b px-4 py-3 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
          >
            <Search className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-muted-foreground flex-1 text-sm">
              {t('labJumpTo')}…
            </span>
            <kbd
              aria-hidden="true"
              className="border-border/70 bg-muted/60 text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[10px]"
            >
              ⌘K
            </kbd>
          </Link>
          <p className="text-muted-foreground px-4 pt-3 pb-1 font-mono text-[10px] tracking-wider uppercase">
            {t('topics')}
          </p>
          <ul className="px-2 pb-2">
            {topics.map((topic) => (
              <li key={topic}>
                <Link
                  href="/blog"
                  className="focus-visible:ring-ring group hover:bg-muted/40 flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5e6ad2]" />
                  <span className="text-foreground flex-1 text-sm">
                    {topic}
                  </span>
                  <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
