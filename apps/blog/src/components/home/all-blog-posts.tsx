import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import type { PostResponse } from '@/types/post.type';
import { CompactPostLink } from './blog-post';
import { YearIndex } from './year-index';

type AllBlogPostsProps = {
  locale: AppLocale;
};

const MAX_YEARS = 5;
const MAX_PER_YEAR = 6;

type YearGroup = {
  year: string;
  id: string;
  posts: { post: PostResponse; entryNumber: number }[];
  count: number;
};

export const AllBlogPosts = async ({ locale }: AllBlogPostsProps) => {
  const t = await getTranslations({ locale, namespace: 'home' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts: PostResponse[] | null = null;
  let totalCount = 0;
  let message: string | null = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 100, locale });

    posts = result.posts;
    totalCount = result.totalCount;
    message = result.message;
  } catch {
    posts = null;
  }

  if (!posts) {
    return (
      <p className="border-rule text-muted-foreground border-t border-l-2 py-6 pl-4 text-sm">
        {t('loadPostsError')}
        {message ? ` (${message})` : ''}
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="border-rule text-muted-foreground border-t border-l-2 py-6 pl-4 text-sm">
        {t('emptyArchivePosts')}
      </p>
    );
  }

  const groups = new Map<string, YearGroup>();
  posts.forEach((post, index) => {
    const year = new Date(post.createdAt).getFullYear().toString();
    const group = groups.get(year) ?? {
      year,
      id: `archive-${year}`,
      posts: [],
      count: 0,
    };
    group.count += 1;
    if (group.posts.length < MAX_PER_YEAR) {
      group.posts.push({ post, entryNumber: totalCount - index });
    }
    groups.set(year, group);
  });
  const years = [...groups.values()]
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, MAX_YEARS);

  return (
    <div className="grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
      <div className="hidden lg:block">
        <div className="sticky top-20">
          <YearIndex
            label={t('archiveIndex')}
            years={years.map(({ year, id, count }) => ({ year, id, count }))}
          />
        </div>
      </div>
      <div>
        {years.map((group) => (
          <section
            key={group.year}
            id={group.id}
            className="scroll-mt-20 pb-8"
            aria-labelledby={`${group.id}-heading`}
          >
            <h3
              id={`${group.id}-heading`}
              className="text-foreground mb-2 flex items-baseline gap-3 font-mono text-lg tabular-nums"
            >
              {group.year}
              <span className="text-muted-foreground text-xs">
                {group.count}
              </span>
            </h3>
            <div className="border-rule border-b">
              {group.posts.map(({ post, entryNumber }) => (
                <CompactPostLink
                  key={post.id}
                  post={post}
                  locale={locale}
                  entryNumber={entryNumber}
                />
              ))}
            </div>
          </section>
        ))}
        <Link
          href="/blog"
          className="press text-accent-ink hover:text-accent-ink-hover focus-visible:ring-ring decoration-accent-ink/40 hover:decoration-accent-ink-hover inline-flex items-center gap-2 rounded-sm text-sm font-medium underline decoration-1 underline-offset-[6px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          {t('viewAllPosts')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
