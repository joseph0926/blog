import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogPostCard } from '../blog/blog-post-card';

export const AllBlogPosts = async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts = null;
  let message = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 6 });

    posts = result.posts;
    message = result.message;
  } catch {
    // 에러 발생 시 posts는 null로 유지되어 에러 UI 표시
  }

  if (!posts) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        게시글을 불러오는 중 에러가 발생했습니다. ({message})
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        더 이상 게시글이 없습니다.
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
          View all posts
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
