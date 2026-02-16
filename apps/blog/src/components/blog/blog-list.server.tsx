import type { AppLocale } from '@/i18n/routing';
import { HydrateClient, serverTrpc } from '@/server/trpc/server';
import { BlogList } from './blog-list';

type BlogListServerProps = {
  locale: AppLocale;
};

export async function BlogListServer({ locale }: BlogListServerProps) {
  await serverTrpc.post.getPosts.prefetchInfinite(
    {
      limit: 10,
      locale,
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
