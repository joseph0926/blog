import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Metadata } from 'next';
import { getRecentPosts } from '@/actions/post.action';
import { BlogFilter } from '@/components/blog/blog-filter';
import { BlogList } from '@/components/blog/blog-list';
import { Container } from '@/components/ui/container';
import { QUERY_KEY } from '@/lib/query-key';

export const metadata: Metadata = {
  title: 'Blogs',
  description: '작성된 블로그 글 전체를 확인해보세요!',
};

export default async function BlogPage() {
  const qc = new QueryClient();

  qc.prefetchQuery({
    queryKey: QUERY_KEY.POST.ALL(),
    queryFn: () => getRecentPosts({ limit: 10 }),
    staleTime: 1000 * 60 * 5,
  });

  const dehydrated = dehydrate(qc);

  return (
    <Container as="main" size="sm" className="relative min-h-[70vh]">
      <BlogFilter />
      <HydrationBoundary state={dehydrated}>
        <BlogList />
      </HydrationBoundary>
    </Container>
  );
}
