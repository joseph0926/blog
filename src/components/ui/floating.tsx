'use client';

import { Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Floating = ({
  items,
  className,
  onClick,
}: {
  items: string[];
  className?: string;
  onClick: (cat: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'fixed right-6 bottom-6 block sm:right-10 sm:bottom-10 xl:hidden',
        className,
      )}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item}
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
                  key={item}
                  className="flex h-10 w-10 cursor-pointer items-center justify-start"
                  onClick={() => onClick(item)}
                >
                  <div className="underline">{item}</div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-800"
      >
        <Filter className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};
