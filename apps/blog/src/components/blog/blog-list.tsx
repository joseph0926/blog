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
import { keepPreviousData } from '@tanstack/react-query';
import { format, type Locale } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { ChevronDown, Search, X } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from 'motion/react';
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

const inkLink =
  'press text-accent-ink hover:text-accent-ink-hover focus-visible:ring-ring decoration-accent-ink/40 hover:decoration-accent-ink-hover inline-flex items-center gap-2 rounded-sm text-sm font-medium underline decoration-1 underline-offset-[6px] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none';

export const BlogList = ({ tags }: BlogListProps) => {
  const t = useTranslations('blog');
  const reduceMotion = useReducedMotion();
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
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = trpc.post.getPosts.useInfiniteQuery(
    getPostsQueryInput(locale, { category, search, year }),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5,
      placeholderData: keepPreviousData,
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
    }, 250);

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
        category: null,
      },
      {
        key: 'source',
        title: t('pathSourceTitle'),
        category: 'source-code',
      },
      {
        key: 'performance',
        title: t('pathPerformanceTitle'),
        category: 'performance',
      },
      {
        key: 'testing',
        title: t('pathTestingTitle'),
        category: 'testing',
      },
    ],
    [t],
  );

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isFetching &&
        !isPlaceholderData
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetching, isPlaceholderData, fetchNextPage],
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
    if (hasNextPage && !isFetching && !isPlaceholderData) {
      fetchNextPage();
    }
  };

  const filterButton =
    'press focus-visible:ring-ring min-h-11 rounded-[6px] px-3 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none';

  return (
    <div className="mx-auto max-w-[960px] py-6 sm:py-10">
      <h1 className="text-foreground font-serif text-[1.75rem] leading-[1.25] font-[640] tracking-[-0.025em] break-keep sm:text-[2.5rem]">
        {t('headline')}
      </h1>
      <p className="text-muted-foreground mt-3 hidden max-w-[68ch] text-[15px] leading-[1.55] sm:block">
        {t('description')}
      </p>

      <div className="mt-6">
        <label
          className="mb-2 block text-[13px] font-semibold"
          htmlFor="blog-search"
        >
          {t('searchLabel')}
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <Input
            id="blog-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className="h-11 rounded-[6px] pr-12 pl-10 text-base shadow-none"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={handleSearchClear}
              aria-label={t('clearSearch')}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-0 right-0 inline-flex size-11 items-center justify-center rounded-[6px] focus-visible:ring-2 focus-visible:outline-none"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : (
            <kbd
              aria-hidden="true"
              className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 text-xs sm:inline"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      <details className="group ledger-details mt-3">
        <summary className="focus-visible:ring-ring flex min-h-11 w-fit cursor-pointer list-none items-center gap-3 rounded-[6px] text-sm marker:hidden focus-visible:ring-2 focus-visible:outline-none">
          <span>{t('filters')}</span>
          {activeFilterCount > 0 && (
            <span className="text-muted-foreground text-xs">
              {t('activeCount', { count: activeFilterCount })}
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
          />
        </summary>
        <div className="space-y-5 pt-3 pb-5">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">{t('paths')}</p>
            <div className="flex flex-wrap gap-1">
              {curatedPaths.map((path) => (
                <button
                  key={path.key}
                  type="button"
                  onClick={() => handleCategoryFilter(path.category)}
                  aria-pressed={
                    path.category === category || (!path.category && !category)
                  }
                  className={cn(
                    filterButton,
                    path.category === category || (!path.category && !category)
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {path.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">{t('topic')}</p>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleCategoryFilter(null)}
                aria-pressed={!category}
                className={cn(
                  filterButton,
                  !category
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
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
                    filterButton,
                    category === tag.name
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {getTagLabel(tag.name)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
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
                className="min-w-[100px] rounded-[6px] shadow-none"
              >
                <SelectValue placeholder={t('all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                {availableYears.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </details>

      <div className="mt-3 flex min-h-11 items-center justify-between gap-4">
        <h2
          className="text-muted-foreground text-sm"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFetching && !isFetchingNextPage
            ? t('loading')
            : t('resultCount', { count: totalCount })}
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-11 text-sm"
          >
            {t('clearAll')}
          </Button>
        )}
      </div>

      {isError && (
        <section className="py-6" role="alert">
          <h2 className="font-semibold">{t('loadPostsError')}</h2>
          <Button variant="outline" onClick={() => refetch()} className="mt-3">
            {t('retry')}
          </Button>
        </section>
      )}
      {isFetching && posts.length === 0 && (
        <LoadingRows label={t('loading')} count={4} />
      )}
      <ul aria-busy={isFetching && !isFetchingNextPage}>
        <AnimatePresence initial={false}>
          {posts.map((post) => (
            <AnimatedPostRow
              key={post.id}
              post={post}
              locale={locale}
              dateLocale={dateLocale}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </AnimatePresence>
      </ul>
      {!isError && !isFetching && posts.length === 0 && (
        <section className="py-12 text-center">
          <Search
            aria-hidden="true"
            className="text-muted-foreground mx-auto mb-4 size-8"
          />
          <h2 className="text-lg font-semibold">{t('noPostsTitle')}</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {t('noPostsDescription')}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={
                search && !category && !year
                  ? handleSearchClear
                  : handleClearFilters
              }
              className="mt-5"
            >
              {search && !category && !year
                ? t('clearSearch')
                : t('clearAllFilters')}
            </Button>
          )}
        </section>
      )}
      {hasNextPage && <div className="h-1" ref={divRef} aria-hidden="true" />}
      {isFetchingNextPage && <LoadingRows label={t('loading')} count={2} />}
      {hasNextPage && !isFetchingNextPage && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isFetching || isPlaceholderData}
          aria-label={t('loadMoreAria')}
          className={cn(inkLink, 'mt-6 min-h-11 disabled:opacity-50')}
        >
          {t('loadMore')}
          <ChevronDown aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
};

function AnimatedPostRow({
  post,
  locale,
  dateLocale,
  reduceMotion,
}: {
  post: PostResponse;
  locale: AppLocale;
  dateLocale: Locale;
  reduceMotion: boolean;
}) {
  const t = useTranslations('blog');
  const isPresent = useIsPresent();
  return (
    <motion.li
      inert={!isPresent}
      aria-hidden={!isPresent || undefined}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.2, 0, 0, 1] }}
      className="overflow-hidden"
    >
      <Link
        href={`/post/${post.slug}`}
        className="group focus-visible:ring-ring active:bg-muted/40 block rounded-[6px] py-5 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      >
        <h3 className="group-hover:text-accent-ink font-serif text-xl leading-[1.4] font-semibold tracking-[-0.015em] break-keep transition-colors duration-150 sm:text-2xl">
          {post.title}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-[15px] leading-[1.55]">
          {post.description}
        </p>
        <p className="text-muted-foreground mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs tabular-nums">
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {format(
              new Date(post.createdAt),
              locale === 'ko' ? 'yyyy.MM.dd' : 'MMM d, yyyy',
              { locale: dateLocale },
            )}
          </time>
          <span>{t('readTime', { minutes: post.readingTime })}</span>
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag.id}>{getTagLabel(tag.name)}</span>
          ))}
        </p>
      </Link>
    </motion.li>
  );
}

function LoadingRows({ label, count }: { label: string; count: number }) {
  return (
    <div role="status" aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3 py-5">
          <div className="skeleton-shimmer h-6 w-4/5 rounded-sm" />
          <div className="skeleton-shimmer h-4 w-full rounded-sm" />
          <div className="skeleton-shimmer h-3 w-40 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
