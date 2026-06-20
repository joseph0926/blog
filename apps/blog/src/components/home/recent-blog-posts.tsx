import { getTranslations } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import type { PostResponse } from '@/types/post.type';
import { HomePostRow } from './blog-post';

type RecentBlogPostsProps = {
  locale: AppLocale;
};

export const RecentBlogPosts = async ({ locale }: RecentBlogPostsProps) => {
  const t = await getTranslations({ locale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts: PostResponse[] | null = null;
  let message: string | null = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 6, locale });

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

  const recentPosts = posts.slice(1, 5);

  if (recentPosts.length === 0) {
    return (
      <div className="border-border/70 bg-muted/20 text-muted-foreground rounded-md border px-5 py-10 text-center text-sm">
        {t('emptyRecentPosts')}
      </div>
    );
  }

  return (
    <div className="border-border/70 border-b">
      {recentPosts.map((post) => (
        <HomePostRow key={post.id} post={post} locale={locale} />
      ))}
    </div>
  );
};
