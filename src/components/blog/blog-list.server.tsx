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

  await qc.prefetchQuery({
    queryKey: QUERY_KEY.POST.ALL(),
    queryFn: () => getRecentPosts({ limit: 10 }),
    staleTime: 1000 * 60 * 5,
  });
  const dehydrated = dehydrate(qc);

  return (
    <HydrationBoundary state={dehydrated}>
      <BlogList />
    </HydrationBoundary>
  );
}
