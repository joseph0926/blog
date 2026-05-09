import { ArrowDown, ArrowRight } from 'lucide-react';
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

const fallbackTopics = ['React', 'TypeScript', 'Performance'];

const EditorialDiagram = ({ post }: { post: PostResponse | null }) => {
  const topics =
    post?.tags.slice(0, 3).map((tag) => tag.name) ?? fallbackTopics;

  return (
    <div
      className="border-border/70 bg-muted/30 relative aspect-square overflow-hidden rounded-md border"
      aria-hidden="true"
    >
      <div className="absolute inset-8">
        <div className="bg-border absolute top-1/2 right-0 left-0 h-px" />
        <div className="bg-border absolute top-0 bottom-0 left-1/2 w-px" />
        <div className="bg-foreground absolute top-[28%] left-[18%] h-px w-24" />
        <div className="bg-foreground absolute right-[18%] bottom-[26%] h-px w-20" />
        <div className="border-foreground absolute top-[28%] left-[48%] h-20 w-20 rounded-bl-3xl border-b border-l" />
        <div className="bg-primary absolute top-[23%] left-[44%] h-2.5 w-2.5 rounded-full" />
        <div className="bg-primary absolute right-[19%] bottom-[31%] h-3.5 w-3.5 rounded-full" />
        <div className="bg-foreground absolute right-[30%] bottom-[48%] h-2 w-2 rounded-full" />
      </div>
      <div className="absolute right-5 bottom-5 left-5 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="border-border/80 bg-background/85 text-muted-foreground rounded-sm border px-2 py-1 font-mono text-[11px]"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
};

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
      <div className="mx-auto grid max-w-[1260px] gap-10 px-4 py-14 sm:py-18 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,26rem)] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <p className="text-primary mb-5 font-mono text-xs font-medium tracking-normal">
            {featuredPost ? t('latestEssay') : t('badge')}
          </p>
          <h1 className="text-foreground max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {featuredPost?.title ?? t('headlineTop')}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7 sm:text-lg">
            {featuredPost?.description ?? t('description')}
          </p>
          {featuredPost && (
            <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs tabular-nums">
              <time dateTime={new Date(featuredPost.createdAt).toISOString()}>
                {formatPostDate(featuredPost.createdAt, locale)}
              </time>
              <span aria-hidden="true">/</span>
              <span>{formatReadTime(featuredPost.readingTime, locale)}</span>
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
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {featuredPost && (
              <Link
                href={`/post/${featuredPost.slug}`}
                className="focus-visible:ring-ring bg-foreground text-background inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-transform duration-150 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-0"
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
        <EditorialDiagram post={featuredPost} />
      </div>
    </section>
  );
}
