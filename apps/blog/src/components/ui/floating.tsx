'use client';

import { Button } from '@joseph0926/ui/components/button';
import { cn } from '@joseph0926/ui/lib/utils';
import { Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { TagResponse } from '@/types/post.type';

export const Floating = ({
  items,
  className,
  onClick,
  clearFilter,
}: {
  items: TagResponse[] | undefined;
  className?: string;
  onClick: (cat: string) => void;
  clearFilter: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6 z-[100] block sm:right-10 sm:bottom-10 xl:hidden',
        className,
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="bg-muted/80 absolute right-2 bottom-full mb-2 flex flex-col gap-2 rounded-2xl px-4 py-2 sm:right-0"
          >
            {items?.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  transition: {
                    delay: idx * 0.05,
                  },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  key={item.id}
                  className="flex cursor-pointer items-center justify-start text-nowrap"
                  onClick={() => onClick(item.name)}
                >
                  <div className="text-xs underline">
                    {item.name.toUpperCase()}
                  </div>
                </button>
              </motion.div>
            ))}
            <Button
              variant="link"
              onClick={clearFilter}
              className="cursor-pointer"
            >
              초기화
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? '필터 닫기' : '필터 열기'}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
      >
        <Filter className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};
