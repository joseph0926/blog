import { HydrationBoundary } from '@tanstack/react-query';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogList } from './blog-list';

export async function BlogListServer() {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx,
    transformer: superjson,
  });

  await helpers.post.getPosts.prefetchInfinite(
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
    <HydrationBoundary state={helpers.dehydrate()}>
      <BlogList />
    </HydrationBoundary>
  );
}
