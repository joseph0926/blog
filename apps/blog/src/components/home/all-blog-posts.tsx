import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogPostCard } from '../blog/blog-post-card';

type AllBlogPostsProps = {
  locale: AppLocale;
};

export const AllBlogPosts = async ({ locale }: AllBlogPostsProps) => {
  const t = await getTranslations({ locale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts = null;
  let message = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 6, locale });

    posts = result.posts;
    message = result.message;
  } catch {
    // 에러 발생 시 posts는 null로 유지되어 에러 UI 표시
  }

  if (!posts) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        {t('loadPostsError')} ({message})
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        {t('emptyArchivePosts')}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      <div className="flex justify-center pt-4">
        <Link
          href="/blog"
          className="border-border text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-medium transition-colors duration-150"
        >
          {t('viewAllPosts')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
