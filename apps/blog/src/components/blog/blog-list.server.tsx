import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { HydrateClient, serverTrpc } from '@/server/trpc/server';
import { BlogList } from './blog-list';

type BlogListServerProps = {
  locale: AppLocale;
};

export async function BlogListServer({ locale }: BlogListServerProps) {
  const ctx = await createTRPCContext({
    headers: new Headers(),
  });

  const { tags } = await appRouter.createCaller(ctx).post.getTags({ locale });

  await serverTrpc.post.getPosts.prefetchInfinite(
    {
      limit: 16,
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
      <BlogList tags={tags} />
    </HydrateClient>
  );
}
