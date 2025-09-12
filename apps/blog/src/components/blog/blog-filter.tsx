'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Tag } from '@/generated/prisma';
import { Input } from '../ui/input';

type BlogFilterHorizontalProps = {
  tags: Tag[];
};

export const BlogFilter = ({ tags }: BlogFilterHorizontalProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchOpen, setSearchOpen] = useState(false);

  const currentCategory = searchParams.get('category');

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleCategoryFilter = (cat: string | null) => {
    if (cat === currentCategory) {
      router.replace(pathname);
    } else {
      router.replace(pathname + '?' + createQueryString('category', cat || ''));
    }
  };

  return (
    <div className="bg-background/80 border-border sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
                !currentCategory
                  ? 'bg-primary text-primary-foreground'
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
                  'rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all',
                  currentCategory === tag.name
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80',
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder="Search posts..."
                    className="h-8"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:bg-muted rounded-lg p-2 transition-colors"
            >
              {searchOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
