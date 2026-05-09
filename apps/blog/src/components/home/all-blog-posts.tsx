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
    // 에러 발생 시 posts는 null로 유지되어 에러 UI 표시
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
  const years = Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a));
  const archivePreview = posts.slice(0, 8);

  return (
    <div className="border-border/70 grid overflow-hidden rounded-md border lg:grid-cols-[16rem_1fr]">
      <aside className="border-border/70 bg-muted/20 border-b p-5 lg:border-r lg:border-b-0">
        <p className="text-muted-foreground mb-4 font-mono text-xs font-medium">
          {t('archiveIndex')}
        </p>
        <div className="space-y-2">
          {years.slice(0, 5).map((year) => (
            <div
              key={year}
              className="border-border/50 grid grid-cols-[1fr_auto] items-center gap-3 border-t pt-3 first:border-t-0 first:pt-0"
            >
              <span className="text-foreground font-mono text-sm tabular-nums">
                {year}
              </span>
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {postsByYear[year]?.length ?? 0}
              </span>
            </div>
          ))}
        </div>
      </aside>
      <div className="p-5">
        <div className="divide-border/70 divide-y">
          {archivePreview.map((post) => (
            <CompactPostLink key={post.id} post={post} locale={locale} />
          ))}
        </div>
        <div className="pt-5">
          <Link
            href="/blog"
            className="focus-visible:ring-ring text-primary hover:text-foreground inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            {t('viewAllPosts')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
