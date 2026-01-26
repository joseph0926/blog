'use client';

import { Input } from '@joseph0926/ui/components/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@joseph0926/ui/components/sheet';
import { cn } from '@joseph0926/ui/lib/utils';
import { Filter, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Tag } from '@/generated/prisma';

type BlogFilterProps = {
  tags: Pick<Tag, 'id' | 'name'>[];
  totalCount?: number;
};

export const BlogFilter = ({ tags, totalCount }: BlogFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentCategory = searchParams.get('category');

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

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    if (searchQuery === currentQ) return;

    const timer = setTimeout(() => {
      const newParams = createQueryString({ q: searchQuery || null });
      router.replace(pathname + (newParams ? '?' + newParams : ''), {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, createQueryString, searchParams]);

  const handleCategoryFilter = (cat: string | null) => {
    const newParams = createQueryString({
      category: cat === currentCategory ? null : cat,
    });
    router.replace(pathname + (newParams ? '?' + newParams : ''), {
      scroll: false,
    });
    setMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    router.replace(pathname, { scroll: false });
    setMobileFilterOpen(false);
  };

  const hasActiveFilters = !!currentCategory || !!searchQuery;

  return (
    <div className="border-border bg-background/80 sticky top-14 z-20 border-b backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div
            className="scrollbar-hide hidden items-center gap-6 overflow-x-auto md:flex"
            role="tablist"
            aria-label="Filter by category"
          >
            <button
              onClick={() => handleCategoryFilter(null)}
              role="tab"
              aria-selected={!currentCategory}
              className="group relative py-1 text-sm font-medium transition-colors duration-150"
            >
              <span
                className={cn(
                  !currentCategory
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                All
              </span>
              {!currentCategory && (
                <motion.span
                  layoutId="category-underline"
                  className="bg-foreground absolute -bottom-3 left-0 h-0.5 w-full"
                />
              )}
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleCategoryFilter(tag.name)}
                role="tab"
                aria-selected={currentCategory === tag.name}
                className="group relative py-1 text-sm font-medium transition-colors duration-150"
              >
                <span
                  className={cn(
                    currentCategory === tag.name
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tag.name}
                </span>
                {currentCategory === tag.name && (
                  <motion.span
                    layoutId="category-underline"
                    className="bg-foreground absolute -bottom-3 left-0 h-0.5 w-full"
                  />
                )}
              </button>
            ))}
          </div>

          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger
              className="border-border hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors md:hidden"
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-foreground h-2 w-2 rounded-full" />
              )}
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto max-h-[70vh]">
              <SheetHeader>
                <SheetTitle>Filter Posts</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-muted-foreground mb-2 block text-sm font-medium">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted-foreground mb-2 block text-sm font-medium">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryFilter(null)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                        !currentCategory
                          ? 'bg-foreground text-background'
                          : 'bg-muted hover:bg-muted/80',
                      )}
                    >
                      All
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleCategoryFilter(tag.name)}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                          currentCategory === tag.name
                            ? 'bg-foreground text-background'
                            : 'bg-muted hover:bg-muted/80',
                        )}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="border-border text-muted-foreground hover:bg-muted w-full rounded-full border py-2 text-sm font-medium transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            {totalCount !== undefined && (
              <span className="text-muted-foreground hidden text-sm sm:block">
                {totalCount} {totalCount === 1 ? 'post' : 'posts'}
              </span>
            )}

            <div className="relative hidden md:block">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-9 w-48 bg-transparent pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-border/50 mt-3 hidden items-center gap-2 border-t pt-3 md:flex"
          >
            <span className="text-muted-foreground text-xs">
              Active filters:
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-muted hover:bg-muted/80 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              >
                &quot;{searchQuery}&quot;
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
