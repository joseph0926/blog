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
import { ArrowRight, ChevronDown, Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { getPostsQueryInput } from '@/lib/post-query';
import { trpc } from '@/lib/trpc';
import type { PostResponse, TagResponse } from '@/types/post.type';

type BlogListProps = {
  tags: TagResponse[];
};

type ArchiveGroup = {
  key: string;
  label: string;
  posts: { post: PostResponse; entryNumber?: number }[];
};

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

const formatEntryNumber = (entryNumber: number) =>
  `No. ${String(Math.max(entryNumber, 0)).padStart(3, '0')}`;

const inkLink =
  'press text-accent-ink hover:text-accent-ink-hover focus-visible:ring-ring decoration-accent-ink/40 hover:decoration-accent-ink-hover inline-flex items-center gap-2 rounded-sm text-sm font-medium underline decoration-1 underline-offset-[6px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none';

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
    getPostsQueryInput(locale, { category, search, year }),
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
  const hasActiveFilters = Boolean(category || search || year);
  const activeFilterCount =
    Number(Boolean(category)) + Number(Boolean(search)) + Number(Boolean(year));
  const getEntryNumber = (index: number) =>
    hasActiveFilters ? undefined : totalCount - index;
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      document.getElementById('blog-search')?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const curatedPaths = useMemo(
    () => [
      {
        key: 'start',
        title: t('pathStartTitle'),
        count: totalCount,
        category: null,
      },
      {
        key: 'source',
        title: t('pathSourceTitle'),
        count: getTagCount(tags, 'source-code'),
        category: 'source-code',
      },
      {
        key: 'performance',
        title: t('pathPerformanceTitle'),
        count: getTagCount(tags, 'performance'),
        category: 'performance',
      },
      {
        key: 'testing',
        title: t('pathTestingTitle'),
        count: getTagCount(tags, 'testing'),
        category: 'testing',
      },
    ],
    [tags, totalCount, t],
  );

  const archiveGroups = useMemo<ArchiveGroup[]>(() => {
    const groups = new Map<string, ArchiveGroup>();
    archivePosts.forEach((post, index) => {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const group = groups.get(key) ?? {
        key,
        label: format(date, locale === 'ko' ? 'yyyy.MM' : 'MMM yyyy', {
          locale: dateLocale,
        }),
        posts: [],
      };
      group.posts.push({
        post,
        entryNumber: hasActiveFilters ? undefined : totalCount - (index + 1),
      });
      groups.set(key, group);
    });
    return [...groups.values()];
  }, [archivePosts, locale, dateLocale, hasActiveFilters, totalCount]);

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

  const noteLabel = 'text-muted-foreground mb-3 text-xs';

  return (
    <div className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        role="status"
      >
        {posts.length > 0 && t('postsLoaded', { count: posts.length })}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <p className={noteLabel}>{t('eyebrow')}</p>
        <p className="text-foreground font-mono text-2xl tabular-nums">
          {totalCount}
        </p>
        <ul className="border-rule mt-6 flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 lg:flex-col lg:gap-0 lg:border-t-0 lg:border-l lg:pt-0">
          {curatedPaths.map((path) => {
            const isActive =
              path.category === category || (!path.category && !category);
            return (
              <li key={path.key}>
                <button
                  type="button"
                  onClick={() => handleCategoryFilter(path.category)}
                  aria-pressed={isActive}
                  className={cn(
                    'press focus-visible:ring-ring -ml-px flex h-8 items-center gap-3 border-l-2 pl-3 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none lg:pl-4',
                    isActive
                      ? 'border-accent-ink text-foreground'
                      : 'text-muted-foreground hover:text-foreground border-transparent',
                  )}
                >
                  <span>{path.title}</span>
                  <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                    {path.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="min-w-0">
        <h1 className="text-foreground max-w-[68ch] text-[2rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
          {t('headline')}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-[68ch] text-base leading-7">
          {t('description')}
        </p>

        <div className="border-rule focus-within:border-accent-ink mt-8 border-y py-4 transition-colors duration-150">
          <label className="sr-only" htmlFor="blog-search">
            {t('searchLabel')}
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2" />
            <Input
              id="blog-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="h-10 rounded-none border-0 bg-transparent pr-20 pl-7 text-base shadow-none focus-visible:ring-0 sm:text-base"
            />
            <kbd className="border-rule text-muted-foreground pointer-events-none absolute top-1/2 right-0 hidden -translate-y-1/2 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] sm:inline-flex">
              /
            </kbd>
            {searchQuery && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-8 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
                aria-label={t('clearSearch')}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="border-rule flex flex-col gap-4 border-b py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground text-xs">{t('topic')}</span>
            <button
              type="button"
              onClick={() => handleCategoryFilter(null)}
              aria-pressed={!category}
              className={cn(
                'press focus-visible:ring-ring rounded-sm border-b py-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                !category
                  ? 'border-accent-ink text-foreground'
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
                  'press focus-visible:ring-ring rounded-sm border-b py-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                  category === tag.name
                    ? 'border-accent-ink text-foreground'
                    : 'text-muted-foreground hover:text-foreground border-transparent',
                )}
              >
                {getTagLabel(tag.name)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label
              className="text-muted-foreground text-xs"
              htmlFor="blog-year"
            >
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
                className="border-rule min-w-[88px] rounded-sm font-mono tabular-nums shadow-none"
              >
                <SelectValue placeholder={t('all')} />
              </SelectTrigger>
              <SelectContent className="border-rule rounded-sm">
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
            {hasActiveFilters && (
              <span className="border-rule inline-flex items-center gap-2 border-l pl-3">
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {t('activeCount', { count: activeFilterCount })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 rounded-sm px-2 text-xs"
                >
                  {t('clearAll')}
                </Button>
              </span>
            )}
          </div>
        </div>

        {isError && posts.length === 0 && (
          <section className="border-rule border-b py-10">
            <h2 className="text-foreground text-lg font-semibold">
              {t('loadPostsError')}
            </h2>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-rule mt-5 rounded-sm shadow-none"
            >
              {t('retry')}
            </Button>
          </section>
        )}
        {isFetching && posts.length === 0 && (
          <LoadingRows label={t('loading')} count={4} />
        )}
        {!isError && !isFetching && posts.length === 0 && (
          <section className="py-16">
            <h2 className="text-foreground text-lg font-semibold">
              {t('noPostsTitle')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t('noPostsDescription')}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="border-rule mt-5 rounded-sm shadow-none"
              >
                {t('clearAllFilters')}
              </Button>
            )}
          </section>
        )}

        {posts.length > 0 && (
          <div className="pt-8">
            {latestPost && (
              <section className="mb-10">
                <h2 className={noteLabel}>{t('latestEssay')}</h2>
                <Link
                  href={`/post/${latestPost.slug}`}
                  className="focus-visible:ring-ring group border-rule active:bg-muted/40 grid gap-2 border-y py-6 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6"
                >
                  <EntryMargin
                    post={latestPost}
                    locale={locale}
                    entryNumber={getEntryNumber(0)}
                    dateLocale={dateLocale}
                  />
                  <div className="min-w-0">
                    <h3 className="text-foreground group-hover:decoration-accent-ink max-w-[68ch] text-xl font-semibold tracking-tight underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-150 sm:text-2xl">
                      {latestPost.title}
                    </h3>
                    <p className="text-muted-foreground mt-3 max-w-[68ch] text-sm leading-6">
                      {latestPost.description}
                    </p>
                    <PostMeta post={latestPost} />
                  </div>
                  <ArrowRight className="text-muted-foreground group-hover:text-accent-ink hidden h-4 w-4 shrink-0 transition-colors duration-150 sm:block sm:pt-1" />
                </Link>
              </section>
            )}
            <section>
              <h2 className={noteLabel}>{t('browseEssays')}</h2>
              {archiveGroups.length === 0 ? (
                <p className="border-rule text-muted-foreground border-t border-l-2 py-6 pl-4 text-sm">
                  {t('emptyArchivePosts')}
                </p>
              ) : (
                <div className="border-rule border-t">
                  {archiveGroups.map((group, index) => (
                    <details
                      key={group.key}
                      open={index === 0}
                      className="group border-rule ledger-details border-b"
                    >
                      <summary className="hover:text-foreground focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-4 py-3 transition-colors duration-150 marker:hidden focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset">
                        <span className="font-mono text-sm tabular-nums">
                          {group.label}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-3 font-mono text-xs tabular-nums">
                          {t('pathCount', { count: group.posts.length })}
                          <ChevronDown className="h-3.5 w-3.5 transition-transform duration-150 group-open:rotate-180" />
                        </span>
                      </summary>
                      <div className="pb-2">
                        {group.posts.map(({ post, entryNumber }) => (
                          <ArchivePostRow
                            key={post.id}
                            post={post}
                            locale={locale}
                            entryNumber={entryNumber}
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
        )}
        {hasNextPage && <div className="h-1" ref={divRef} aria-hidden="true" />}
        {isFetchingNextPage && <LoadingRows label={t('loading')} count={2} />}
        {hasNextPage && !isFetchingNextPage && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleLoadMore}
              aria-label={t('loadMoreAria')}
              className={inkLink}
            >
              {t('loadMore')}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EntryMargin = ({
  post,
  locale,
  entryNumber,
  dateLocale,
}: {
  post: PostResponse;
  locale: AppLocale;
  entryNumber?: number;
  dateLocale: Locale;
}) => (
  <div className="text-muted-foreground flex items-baseline gap-3 font-mono text-xs tabular-nums sm:flex-col sm:gap-1">
    {entryNumber !== undefined && (
      <span className="text-foreground">{formatEntryNumber(entryNumber)}</span>
    )}
    <time dateTime={new Date(post.createdAt).toISOString()}>
      {format(
        new Date(post.createdAt),
        locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd, yyyy',
        { locale: dateLocale },
      )}
    </time>
  </div>
);

const PostMeta = ({ post }: { post: PostResponse }) => {
  const t = useTranslations('blog');

  return (
    <p className="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <span className="font-mono text-xs tabular-nums">
        {t('readTime', { minutes: post.readingTime })}
      </span>
      {post.tags.slice(0, 3).map((tag) => (
        <span key={tag.id} className="flex items-center gap-3">
          <span aria-hidden="true" className="bg-rule h-3 w-px" />
          {getTagLabel(tag.name)}
        </span>
      ))}
    </p>
  );
};

const ArchivePostRow = ({
  post,
  locale,
  entryNumber,
  dateLocale,
}: {
  post: PostResponse;
  locale: AppLocale;
  entryNumber?: number;
  dateLocale: Locale;
}) => {
  const t = useTranslations('blog');

  return (
    <Link
      href={`/post/${post.slug}`}
      className="border-rule focus-visible:ring-ring group active:bg-muted/40 grid gap-1 border-t py-3 text-sm focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6"
    >
      <span className="text-muted-foreground flex items-baseline gap-3 font-mono text-xs tabular-nums">
        {entryNumber !== undefined ? (
          <span className="text-foreground">
            {formatEntryNumber(entryNumber)}
          </span>
        ) : (
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {format(
              new Date(post.createdAt),
              locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd',
              { locale: dateLocale },
            )}
          </time>
        )}
      </span>
      <span className="min-w-0">
        <span className="text-foreground group-hover:decoration-accent-ink block truncate underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-150">
          {post.title}
        </span>
        <span className="text-muted-foreground mt-1 block truncate text-xs">
          {post.tags[0] ? getTagLabel(post.tags[0].name) : getPostYear(post)}
        </span>
      </span>
      <span className="text-muted-foreground font-mono text-xs tabular-nums">
        {t('readTime', { minutes: post.readingTime })}
      </span>
    </Link>
  );
};

const LoadingRows = ({ label, count }: { label: string; count: number }) => {
  return (
    <div className="border-rule mt-6 border-b" role="status" aria-label={label}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border-rule grid gap-2 border-t py-4 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6"
        >
          <div className="skeleton-shimmer h-3 w-14 rounded-sm" />
          <div className="space-y-2">
            <div className="skeleton-shimmer h-4 max-w-xl rounded-sm" />
            <div className="skeleton-shimmer h-3 max-w-xs rounded-sm" />
          </div>
          <div className="skeleton-shimmer h-3 w-12 rounded-sm" />
        </div>
      ))}
    </div>
  );
};
