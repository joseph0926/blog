import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getRecentPosts, getTags } from '@/actions/post.action';
import { BlogFilter } from '@/components/blog/blog-filter';
import { BlogFilterSkeleton } from '@/components/blog/blog-filter.skeleton';
import { BlogList } from '@/components/blog/blog-list';
import { BlogPostSkeleton } from '@/components/home/blog-post.skeleton';
import { Container } from '@/components/ui/container';
import { QUERY_KEY } from '@/lib/query-key';

export const metadata: Metadata = {
  title: 'Blogs',
  description: '작성된 블로그 글 전체를 확인해보세요!',
};

export default async function BlogPage() {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: QUERY_KEY.POST.ALL(),
    queryFn: () => getRecentPosts({ limit: 10 }),
    staleTime: 1000 * 60 * 5,
  });
  await qc.prefetchQuery({
    queryKey: QUERY_KEY.TAG.ALL,
    queryFn: getTags,
    staleTime: 1000 * 60 * 5,
  });

  const dehydrated = dehydrate(qc);

  return (
    <Container as="main" size="sm" className="relative min-h-[70vh]">
      <HydrationBoundary state={dehydrated}>
        <Suspense fallback={<BlogFilterSkeleton />}>
          <BlogFilter />
        </Suspense>
        <Suspense
          fallback={
            <div className="grid h-full w-full grid-cols-1 gap-x-4 gap-y-8 py-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <BlogPostSkeleton type="col" key={idx} />
              ))}
            </div>
          }
        >
          <BlogList />
        </Suspense>
      </HydrationBoundary>
    </Container>
  );
}
