import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import type { PostResponse } from '@/types/post.type';
import { CompactPostLink } from './blog-post';

type AllBlogPostsProps = {
  locale: AppLocale;
};

const MAX_YEARS = 5;
const MAX_PER_YEAR = 6;

export const AllBlogPosts = async ({ locale }: AllBlogPostsProps) => {
  const t = await getTranslations({ locale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts: PostResponse[] | null = null;
  let message: string | null = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 100, locale });

    posts = result.posts;
    message = result.message;
  } catch {
    posts = null;
  }

  if (!posts) {
    return (
      <div className="border-border/70 bg-muted/20 text-muted-foreground rounded-md border px-5 py-10 text-center text-sm">
        {t('loadPostsError')}
        {message ? ` (${message})` : ''}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="border-border/70 bg-muted/20 text-muted-foreground rounded-md border px-5 py-10 text-center text-sm">
        {t('emptyArchivePosts')}
      </div>
    );
  }

  const postsByYear = posts.reduce<Record<string, PostResponse[]>>(
    (acc, post) => {
      const year = new Date(post.createdAt).getFullYear().toString();
      acc[year] = [...(acc[year] ?? []), post];
      return acc;
    },
    {},
  );
  const years = Object.keys(postsByYear)
    .sort((a, b) => Number(b) - Number(a))
    .slice(0, MAX_YEARS);

  return (
    <div>
      <div className="border-border/70 divide-border/70 divide-y border-t">
        {years.map((year) => {
          const yearPosts = postsByYear[year] ?? [];
          return (
            <div
              key={year}
              className="grid gap-3 py-6 sm:grid-cols-[6rem_1fr] sm:gap-8"
            >
              <div className="flex items-baseline gap-2 sm:flex-col sm:items-start sm:gap-1">
                <span className="text-foreground font-mono text-xl font-semibold tabular-nums">
                  {year}
                </span>
                <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                  {yearPosts.length}
                </span>
              </div>
              <div className="divide-border/50 divide-y">
                {yearPosts.slice(0, MAX_PER_YEAR).map((post) => (
                  <CompactPostLink key={post.id} post={post} locale={locale} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-6">
        <Link
          href="/blog"
          className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-md text-sm font-medium text-[#5e6ad2] transition-colors duration-150 hover:text-[#828fff] focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          {t('viewAllPosts')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
