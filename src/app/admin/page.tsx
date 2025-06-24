import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getRecentPosts } from '@/actions/post.action';
import PostsTable from '@/components/admin/posts-table';

export const metadata = { title: 'Admin | 게시글 관리' };

export default async function AdminPostsPage() {
  const { data, success } = await getRecentPosts({ limit: 5 });
  if (!success || !data) notFound();

  const { posts } = data;
  if (!posts.length) notFound();

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">게시글 관리</h1>
      <Suspense fallback={<p className="text-muted-foreground">로딩 중…</p>}>
        <PostsTable initialPosts={posts} />
      </Suspense>
    </section>
  );
}
