import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getTags } from '@/actions/post.action';
import { QUERY_KEY } from '@/lib/query-key';
import { BlogFilter } from './blog-filter';

export async function BlogFilterServer() {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: QUERY_KEY.TAG.ALL,
    queryFn: getTags,
    staleTime: 1000 * 60 * 5,
  });

  const dehydrated = dehydrate(qc);

  return (
    <HydrationBoundary state={dehydrated}>
      <BlogFilter />
    </HydrationBoundary>
  );
}
