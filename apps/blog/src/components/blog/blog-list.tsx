'use client';

import { Button } from '@joseph0926/ui/components/button';
import { Input } from '@joseph0926/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@joseph0926/ui/components/select';
import { cn } from '@joseph0926/ui/lib/utils';
import { format, type Locale } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  Code2,
  Gauge,
  List,
  Search,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { trpc } from '@/lib/trpc';
import type { PostResponse, TagResponse } from '@/types/post.type';

type BlogListProps = {
  tags: TagResponse[];
};

type ArchiveGroup = {
  key: string;
  label: string;
  posts: PostResponse[];
};

const pathIconClassName = 'h-7 w-7 stroke-[1.5]';

const getTagCount = (tags: TagResponse[], name: string) =>
  tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())?.count ?? 0;

const getPostYear = (post: PostResponse) =>
  new Date(post.createdAt).getFullYear().toString();

const priorityTagNames = [
  'react',
  'typescript',
  'nextjs',
  'testing',
  'performance',
  'source-code',
  'react-query',
  'react-router',
  'vitest',
];

const tagLabelMap: Record<string, string> = {
  nextjs: 'Next.js',
  react: 'React',
  'react-query': 'React Query',
  'react-router': 'React Router',
  'source-code': 'Source reading',
  testing: 'Testing',
  performance: 'Performance',
  typescript: 'TypeScript',
  vitest: 'Vitest',
};

const getTagLabel = (tagName: string) =>
  tagLabelMap[tagName.toLowerCase()] ?? tagName;

export const BlogList = ({ tags }: BlogListProps) => {
  const t = useTranslations('blog');
  const locale = useLocale() as AppLocale;
  const dateLocale = locale === 'ko' ? ko : enUS;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? undefined;
  const search = searchParams.get('q') ?? undefined;
  const year = searchParams.get('year') ?? undefined;
  const [searchQuery, setSearchQuery] = useState(search ?? '');
  const divRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = trpc.post.getPosts.useInfiniteQuery(
    {
      limit: 16,
      locale,
      filter: { category, search, year },
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5,
    },
  );

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.totalCount ?? posts.length;
  const availableYears = data?.pages[0]?.availableYears ?? [];
  const latestPost = posts[0];
  const archivePosts = posts.slice(1);
  const visibleTags = useMemo(() => {
    const priorityTags = priorityTagNames
      .map((name) =>
        tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase()),
      )
      .filter((tag): tag is TagResponse => Boolean(tag));
    const activeTag = category
      ? tags.find((tag) => tag.name === category)
      : undefined;
    if (activeTag && !priorityTags.some((tag) => tag.id === activeTag.id)) {
      return [...priorityTags.slice(0, 8), activeTag];
    }
    return priorityTags.slice(0, 9);
  }, [category, tags]);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      return params.toString();
    },
    [searchParams],
  );

  const replaceWithParams = useCallback(
    (query: string) => {
      router.replace(pathname + (query ? `?${query}` : ''), {
        scroll: false,
      });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (searchQuery === (search ?? '')) return;

    const timer = setTimeout(() => {
      replaceWithParams(createQueryString({ q: searchQuery || null }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, search, createQueryString, replaceWithParams]);

  const handleCategoryFilter = (nextCategory: string | null) => {
    replaceWithParams(
      createQueryString({
        category: nextCategory === category ? null : nextCategory,
      }),
    );
  };

  const handleYearFilter = (nextYear: string | null) => {
    replaceWithParams(
      createQueryString({
        year: nextYear === year ? null : nextYear,
      }),
    );
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    replaceWithParams(createQueryString({ q: null }));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    replaceWithParams('');
  };

  const hasActiveFilters = Boolean(category || search || year);
  const activeFilterCount =
    Number(Boolean(category)) + Number(Boolean(search)) + Number(Boolean(year));

  const curatedPaths = useMemo(
    () => [
      {
        key: 'start',
        title: t('pathStartTitle'),
        description: t('pathStartDescription'),
        count: totalCount,
        icon: List,
        category: null,
      },
      {
        key: 'source',
        title: t('pathSourceTitle'),
        description: t('pathSourceDescription'),
        count: getTagCount(tags, 'source-code'),
        icon: Code2,
        category: 'source-code',
      },
      {
        key: 'performance',
        title: t('pathPerformanceTitle'),
        description: t('pathPerformanceDescription'),
        count: getTagCount(tags, 'performance'),
        icon: Gauge,
        category: 'performance',
      },
      {
        key: 'testing',
        title: t('pathTestingTitle'),
        description: t('pathTestingDescription'),
        count: getTagCount(tags, 'testing'),
        icon: CheckCircle2,
        category: 'testing',
      },
    ],
    [tags, totalCount, t],
  );

  const archiveGroups = useMemo<ArchiveGroup[]>(() => {
    const groups = archivePosts.reduce<Record<string, PostResponse[]>>(
      (acc, post) => {
        const date = new Date(post.createdAt);
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        acc[key] = acc[key] ?? [];
        acc[key].push(post);
        return acc;
      },
      {},
    );

    return Object.entries(groups).map(([key, groupPosts]) => {
      const [groupYear, groupMonth] = key.split('-');
      return {
        key,
        label: `${groupYear} / ${groupMonth}`,
        posts: groupPosts,
      };
    });
  }, [archivePosts]);

  const popularPaths = curatedPaths.filter((path) => path.key !== 'start');

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const currentRef = divRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div className="py-10 sm:py-14">
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        role="status"
      >
        {posts.length > 0 && t('postsLoaded', { count: posts.length })}
      </div>
      <section className="border-border/70 grid gap-8 border-b pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,520px)] lg:items-start">
        <div className="max-w-2xl">
          <p className="text-muted-foreground font-mono text-xs">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t('headline')}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base leading-7">
            {t('description')}
          </p>
        </div>
        <div className="lg:pt-12">
          <label className="sr-only" htmlFor="blog-search">
            {t('searchLabel')}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              id="blog-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="border-border/80 bg-background h-12 rounded-md pr-20 pl-11 shadow-none"
            />
            <span className="border-border/80 text-muted-foreground pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
              /
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-9 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label={t('clearSearch')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>
      <section className="border-border/70 grid border-b md:grid-cols-4">
        {curatedPaths.map((path, index) => {
          const Icon = path.icon;
          const isActive =
            path.category === category || (!path.category && !category);
          return (
            <button
              key={path.key}
              type="button"
              onClick={() => handleCategoryFilter(path.category)}
              aria-pressed={isActive}
              className={cn(
                'group border-border/70 hover:bg-muted/45 focus-visible:ring-ring flex min-h-36 flex-col items-start justify-between gap-5 border-b px-1 py-6 text-left transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:outline-none sm:px-3 md:border-b-0 md:px-6',
                index > 0 && 'md:border-l',
              )}
            >
              <Icon className={pathIconClassName} />
              <span className="w-full">
                <span className="block text-base font-medium">
                  {path.title}
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  {path.description}
                </span>
              </span>
              <span className="flex w-full items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground font-mono">
                  {t('pathCount', { count: path.count })}
                </span>
                <ArrowRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          );
        })}
      </section>
      <section className="border-border/70 flex flex-col gap-4 border-b py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          <span className="font-medium">{t('topic')}</span>
          <button
            type="button"
            onClick={() => handleCategoryFilter(null)}
            aria-pressed={!category}
            className={cn(
              'border-b py-1 transition-colors',
              !category
                ? 'border-foreground text-foreground'
                : 'text-muted-foreground hover:text-foreground border-transparent',
            )}
          >
            {t('all')}
          </button>
          {visibleTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleCategoryFilter(tag.name)}
              aria-pressed={category === tag.name}
              className={cn(
                'border-b py-1 transition-colors',
                category === tag.name
                  ? 'border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {getTagLabel(tag.name)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="font-medium" htmlFor="blog-year">
            {t('year')}
          </label>
          <Select
            value={year ?? 'all'}
            onValueChange={(value) =>
              handleYearFilter(value === 'all' ? null : value)
            }
          >
            <SelectTrigger
              id="blog-year"
              size="sm"
              className="min-w-[88px] font-mono tabular-nums"
            >
              <SelectValue placeholder={t('all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {availableYears.map((yearOption) => (
                <SelectItem
                  key={yearOption}
                  value={yearOption}
                  className="font-mono tabular-nums"
                >
                  {yearOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground font-mono text-xs">
            {t('resultCount', { count: totalCount })}
          </span>
          {hasActiveFilters && (
            <span className="border-border/70 inline-flex items-center gap-2 border-l pl-3">
              <span className="text-muted-foreground font-mono text-xs">
                {t('activeCount', { count: activeFilterCount })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs"
              >
                {t('clearAll')}
              </Button>
            </span>
          )}
        </div>
      </section>
      {isError && posts.length === 0 && (
        <section className="border-border/70 border-b py-12 text-center">
          <BookOpenText className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
          <h2 className="text-lg font-semibold">{t('loadPostsError')}</h2>
          <Button variant="outline" onClick={() => refetch()} className="mt-6">
            {t('retry')}
          </Button>
        </section>
      )}
      {isFetching && posts.length === 0 && <LoadingRows label={t('loading')} />}
      {!isError && !isFetching && posts.length === 0 && (
        <section className="py-20 text-center">
          <BookOpenText className="text-muted-foreground mx-auto mb-4 h-10 w-10" />
          <h2 className="text-lg font-semibold">{t('noPostsTitle')}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('noPostsDescription')}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="mt-6"
            >
              {t('clearAllFilters')}
            </Button>
          )}
        </section>
      )}
      {posts.length > 0 && (
        <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 space-y-8">
            {latestPost && (
              <section>
                <h2 className="mb-4 text-xl font-medium tracking-tight">
                  {t('latestEssay')}
                </h2>
                <Link
                  href={`/post/${latestPost.slug}`}
                  className="group border-border/70 focus-visible:ring-ring grid gap-6 border-y py-5 focus-visible:ring-2 focus-visible:outline-none md:grid-cols-[minmax(220px,420px)_minmax(0,1fr)]"
                >
                  <CodePreview />
                  <article className="flex min-w-0 items-center justify-between gap-6">
                    <div className="min-w-0">
                      <h3 className="group-hover:text-primary max-w-2xl text-2xl font-medium tracking-tight text-balance">
                        {latestPost.title}
                      </h3>
                      <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6">
                        {latestPost.description}
                      </p>
                      <PostMeta post={latestPost} locale={locale} />
                    </div>
                    <ArrowRight className="text-muted-foreground group-hover:text-foreground hidden h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 md:block" />
                  </article>
                </Link>
              </section>
            )}
            <section>
              <h2 className="mb-4 text-xl font-medium tracking-tight">
                {t('browseEssays')}
              </h2>
              {archiveGroups.length === 0 ? (
                <div className="border-border/70 text-muted-foreground border-y py-8 text-sm">
                  {t('emptyArchivePosts')}
                </div>
              ) : (
                <div className="border-border/70 border-y">
                  {archiveGroups.map((group, index) => (
                    <details
                      key={group.key}
                      open={index === 0}
                      className="group border-border/70 border-b last:border-b-0"
                    >
                      <summary className="bg-muted/45 flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 marker:hidden">
                        <span className="font-mono text-sm font-medium">
                          {group.label}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-3 font-mono text-xs">
                          {t('pathCount', { count: group.posts.length })}
                          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                        </span>
                      </summary>
                      <div className="grid gap-x-8 px-4 py-3 md:grid-cols-2">
                        {group.posts.map((post) => (
                          <ArchivePostRow
                            key={post.id}
                            post={post}
                            locale={locale}
                            dateLocale={dateLocale}
                          />
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>
          </div>
          <aside className="border-border/70 space-y-7 pt-1 lg:border-l lg:pl-6">
            <section>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">
                  {t('currentlyReading')}
                </h2>
                <span className="text-muted-foreground font-mono text-xs">
                  2 / 4
                </span>
              </div>
              <div className="bg-muted mt-3 h-1">
                <div className="bg-primary h-full w-1/2" />
              </div>
              <div className="mt-5 space-y-4">
                {posts.slice(0, 2).map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="focus-visible:ring-ring block text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="block leading-5 font-medium">
                      {post.title}
                    </span>
                    <span className="text-muted-foreground mt-1 block font-mono text-xs">
                      {index === 0
                        ? t('minutesLeft', { minutes: post.readingTime })
                        : t('readTime', { minutes: post.readingTime })}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="border-border/70 border-t pt-6">
              <h2 className="text-sm font-semibold">{t('popularPaths')}</h2>
              <div className="mt-4 space-y-4">
                {popularPaths.map((path) => (
                  <button
                    key={path.key}
                    type="button"
                    onClick={() => handleCategoryFilter(path.category)}
                    className="focus-visible:ring-ring block w-full text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span className="block font-medium">{path.title}</span>
                    <span className="text-muted-foreground mt-1 block font-mono text-xs">
                      {t('pathCount', { count: path.count })}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
      {hasNextPage && <div className="h-1" ref={divRef} aria-hidden="true" />}
      {isFetchingNextPage && (
        <div
          className="mt-8 flex justify-center"
          role="status"
          aria-label={t('loading')}
        >
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
      {hasNextPage && !isFetchingNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={handleLoadMore}
            aria-label={t('loadMoreAria')}
          >
            {t('loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
};

const PostMeta = ({
  post,
  locale,
}: {
  post: PostResponse;
  locale: AppLocale;
}) => {
  const t = useTranslations('blog');
  const dateLocale = locale === 'ko' ? ko : enUS;

  return (
    <div className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
      <time
        className="font-mono"
        dateTime={new Date(post.createdAt).toISOString()}
      >
        {format(
          new Date(post.createdAt),
          locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd, yyyy',
          { locale: dateLocale },
        )}
      </time>
      <span className="font-mono">
        {t('readTime', { minutes: post.readingTime })}
      </span>
      {post.tags.slice(0, 3).map((tag) => (
        <span key={tag.id} className="border-border/80 border-b">
          {getTagLabel(tag.name)}
        </span>
      ))}
    </div>
  );
};

const ArchivePostRow = ({
  post,
  locale,
  dateLocale,
}: {
  post: PostResponse;
  locale: AppLocale;
  dateLocale: Locale;
}) => {
  return (
    <Link
      href={`/post/${post.slug}`}
      className="border-border/60 focus-visible:ring-ring grid gap-3 border-b py-3 text-sm last:border-b-0 focus-visible:ring-2 focus-visible:outline-none sm:grid-cols-[4.75rem_minmax(0,1fr)_3.5rem] md:last:border-b"
    >
      <time
        dateTime={new Date(post.createdAt).toISOString()}
        className="text-muted-foreground font-mono text-xs"
      >
        {format(
          new Date(post.createdAt),
          locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd',
          { locale: dateLocale },
        )}
      </time>
      <span className="min-w-0">
        <span className="block truncate font-medium">{post.title}</span>
        <span className="text-muted-foreground mt-1 block truncate text-xs">
          {post.tags[0] ? getTagLabel(post.tags[0].name) : getPostYear(post)}
        </span>
      </span>
      <span className="text-muted-foreground font-mono text-xs">
        {post.readingTime} min
      </span>
    </Link>
  );
};

const CodePreview = () => {
  return (
    <div className="border-border/70 bg-muted/35 text-muted-foreground overflow-hidden rounded-md border p-4 font-mono text-xs leading-6">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3">
        <span>1</span>
        <span>async function loadPosts(cursor?: string) {'{'}</span>
        <span>2</span>
        <span>{"  const res = await fetch('/api/posts')"}</span>
        <span>3</span>
        <span>{'  const json = await res.json()'}</span>
        <span>4</span>
        <span>{'  return json.posts as Post[]'}</span>
        <span>5</span>
        <span>{'}'}</span>
      </div>
      <div className="mt-3 text-[11px]">app/blog/actions.ts</div>
    </div>
  );
};

const LoadingRows = ({ label }: { label: string }) => {
  return (
    <section className="space-y-4 py-10" role="status" aria-label={label}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="border-border/70 grid gap-4 border-b pb-4 md:grid-cols-[6rem_minmax(0,1fr)_4rem]"
        >
          <div className="bg-muted h-4 rounded" />
          <div className="space-y-2">
            <div className="bg-muted h-4 max-w-xl rounded" />
            <div className="bg-muted h-3 max-w-md rounded" />
          </div>
          <div className="bg-muted h-4 rounded" />
        </div>
      ))}
    </section>
  );
};
