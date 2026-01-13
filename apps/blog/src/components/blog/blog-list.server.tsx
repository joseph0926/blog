import { HydrateClient, serverTrpc } from '@/server/trpc/server';
import { BlogList } from './blog-list';

export async function BlogListServer() {
  await serverTrpc.post.getPosts.prefetchInfinite(
    {
      limit: 10,
      filter: { category: undefined },
    },
    {
      initialCursor: undefined,
      pages: 1,
      getNextPageParam: (lastPage) => {
        const cursor = lastPage.nextCursor;
        if (cursor) {
          return cursor;
        }

        return undefined;
      },
    },
  );

  return (
    <HydrateClient>
      <BlogList />
    </HydrateClient>
  );
}
