'use client';

import { Button } from '@joseph0926/ui/components/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@joseph0926/ui/components/drawer';
import { Input } from '@joseph0926/ui/components/input';
import { cn } from '@joseph0926/ui/lib/utils';
import { Filter, Search, SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tag } from '@/generated/prisma/client';

type BlogFilterProps = {
  tags: Pick<Tag, 'id' | 'name'>[];
  totalCount?: number;
};

export const BlogFilter = ({ tags, totalCount }: BlogFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
    const searchFromUrl = searchParams.get('q') || '';
    if (searchQuery === searchFromUrl) return;

    const timer = setTimeout(() => {
      replaceWithParams(createQueryString({ q: searchQuery || null }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchParams, createQueryString, replaceWithParams]);

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryFilter = (category: string | null) => {
    const nextCategory = category === currentCategory ? null : category;
    replaceWithParams(
      createQueryString({
        category: nextCategory,
      }),
    );
    setMobileFilterOpen(false);
  };

  const handleSearchClear = () => {
    handleSearchInputChange('');
    replaceWithParams(
      createQueryString({
        q: null,
      }),
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    replaceWithParams('');
    setMobileFilterOpen(false);
  };

  const hasActiveFilters = Boolean(currentCategory || currentSearch);
  const activeFilterCount =
    Number(Boolean(currentCategory)) + Number(Boolean(currentSearch));

  const categoryOptions = useMemo(
    () => [
      { id: 'all', name: 'All', value: null as string | null },
      ...tags.map((tag) => ({
        ...tag,
        value: tag.name,
      })),
    ],
    [tags],
  );

  const getCategoryButtonClassName = (isActive: boolean) =>
    cn(
      'inline-flex h-8 items-center rounded-full border px-3.5 text-xs font-medium transition-colors',
      isActive
        ? 'border-foreground bg-foreground text-background shadow-sm'
        : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
    );

  return (
    <div className="border-border/70 bg-background/80 sticky top-14 z-20 border-b backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="from-background via-background to-muted/35 border-border/70 rounded-xl border bg-linear-to-br p-3 shadow-xs md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </span>
              <span className="text-muted-foreground text-xs">
                {tags.length} topics
              </span>
              {totalCount !== undefined && (
                <span className="text-muted-foreground text-xs">
                  {totalCount} {totalCount === 1 ? 'post' : 'posts'}
                </span>
              )}
              {hasActiveFilters && (
                <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            <Drawer
              open={mobileFilterOpen}
              onOpenChange={setMobileFilterOpen}
              direction="bottom"
            >
              <DrawerTrigger
                className="border-border hover:bg-muted inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors md:hidden"
                aria-label="Open filters"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-primary h-2 w-2 rounded-full" />
                )}
              </DrawerTrigger>
              <DrawerContent className="h-fit overflow-y-auto px-8">
                <DrawerHeader>
                  <DrawerTitle>Filter Posts</DrawerTitle>
                </DrawerHeader>
                <div className="mt-4 space-y-5">
                  <div>
                    <p className="text-muted-foreground mb-2 text-sm font-medium">
                      Category
                    </p>
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="Filter posts by category"
                    >
                      {categoryOptions.map((option) => {
                        const isActive = option.value === currentCategory;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleCategoryFilter(option.value)}
                            aria-pressed={isActive}
                            className={getCategoryButtonClassName(isActive)}
                          >
                            {option.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="w-full"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="Search by title or description..."
                className="bg-background h-9 w-full pr-9 pl-9 md:h-10"
              />
              {searchQuery && (
                <button
                  onClick={handleSearchClear}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-9 justify-start px-0 text-xs md:h-10 md:justify-center md:px-3"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="mt-3 hidden md:block">
            <div
              className="scrollbar-hide -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1"
              role="group"
              aria-label="Filter posts by category"
            >
              {categoryOptions.map((option) => {
                const isActive = option.value === currentCategory;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleCategoryFilter(option.value)}
                    aria-pressed={isActive}
                    className={getCategoryButtonClassName(isActive)}
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-border/60 mt-3 flex flex-wrap items-center gap-2 border-t pt-3"
              >
                <span className="text-muted-foreground text-xs font-medium">
                  Active filters
                </span>
                {currentCategory && (
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className="bg-muted hover:bg-muted/80 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    {currentCategory}
                    <X className="h-3 w-3" />
                  </button>
                )}
                {currentSearch && (
                  <button
                    onClick={handleSearchClear}
                    className="bg-muted hover:bg-muted/80 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    &quot;{currentSearch}&quot;
                    <X className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
                >
                  Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
