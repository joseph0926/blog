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
  let totalCount = 0;
  let message: string | null = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 6, locale });

    posts = result.posts;
    totalCount = result.totalCount;
    message = result.message;
  } catch {
    posts = null;
  }

  if (!posts) {
    return (
      <p className="border-rule text-muted-foreground border-t border-l-2 py-6 pl-4 text-sm">
        {t('loadPostsError')}
        {message ? ` (${message})` : ''}
      </p>
    );
  }

  const recentPosts = posts.slice(1, 5);

  if (recentPosts.length === 0) {
    return (
      <p className="border-rule text-muted-foreground border-t border-l-2 py-6 pl-4 text-sm">
        {t('emptyRecentPosts')}
      </p>
    );
  }

  return (
    <div className="border-rule border-b">
      {recentPosts.map((post, index) => (
        <HomePostRow
          key={post.id}
          post={post}
          locale={locale}
          entryNumber={totalCount - index - 1}
        />
      ))}
    </div>
  );
};
