import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogFilter } from './blog-filter';

export async function BlogFilterServer() {
  const ctx = await createTRPCContext({
    headers: new Headers(),
  });

  const { tags } = await appRouter.createCaller(ctx).post.getTags();

  return <BlogFilter tags={tags} />;
}
