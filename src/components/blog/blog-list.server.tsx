import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getRecentPosts } from '@/actions/post.action';
import { QUERY_KEY } from '@/lib/query-key';
import { BlogList } from './blog-list';

export async function BlogListServer() {
  const qc = new QueryClient();

  await qc.prefetchInfiniteQuery({
    queryKey: QUERY_KEY.POST.ALL({ category: undefined }),
    queryFn: ({ pageParam = undefined }: { pageParam: string | undefined }) =>
      getRecentPosts({
        limit: 10,
        cursor: pageParam,
        filter: { category: undefined },
      }),
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 5,
  });

  const dehydrated = dehydrate(qc);

  return (
    <HydrationBoundary state={dehydrated}>
      <BlogList />
    </HydrationBoundary>
  );
}
