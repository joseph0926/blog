import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogFilter } from './blog-filter';

type BlogFilterServerProps = {
  locale: AppLocale;
};

export async function BlogFilterServer({ locale }: BlogFilterServerProps) {
  const ctx = await createTRPCContext({
    headers: new Headers(),
  });

  const { tags } = await appRouter.createCaller(ctx).post.getTags({ locale });

  return <BlogFilter tags={tags} />;
}
