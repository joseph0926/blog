import type { AppLocale } from '@/i18n/routing';
import { getPostsQueryInput, type PostListFilter } from '@/lib/post-query';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { HydrateClient, serverTrpc } from '@/server/trpc/server';
import { BlogList } from './blog-list';

type BlogListServerProps = {
  locale: AppLocale;
  filter: PostListFilter;
};

export async function BlogListServer({ locale, filter }: BlogListServerProps) {
  const ctx = await createTRPCContext({
    headers: new Headers(),
  });

  const { tags } = await appRouter.createCaller(ctx).post.getTags({ locale });

  await serverTrpc.post.getPosts.prefetchInfinite(
    getPostsQueryInput(locale, filter),
    {
      initialCursor: undefined,
      pages: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  return (
    <HydrateClient>
      <BlogList tags={tags} />
    </HydrateClient>
  );
}
