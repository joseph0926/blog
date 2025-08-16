import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import PostsTable from '@/components/admin/posts-table';
import { pageRobots } from '@/meta/robots';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';

export const metadata = {
  title: 'Admin | 게시글 관리',
  robots: pageRobots.admin,
};

export default async function AdminPostsPage() {
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 5 });

    posts = result.posts;
  } catch (e) {
    console.error(`Failed to fetch posts`, e);
  }

  if (!posts?.length) notFound();
  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">게시글 관리</h1>
      <Suspense fallback={<p className="text-muted-foreground">로딩 중…</p>}>
        <PostsTable initialPosts={posts} />
      </Suspense>
    </section>
  );
}
