'use client';

import { Skeleton } from '@joseph0926/ui/components/skeleton';
import { cn } from '@joseph0926/ui/lib/utils';

type BlogPostSkeletonProps = {
  type?: 'row' | 'col';
};

export const BlogPostSkeleton = ({ type = 'col' }: BlogPostSkeletonProps) => {
  return (
    <article
      className={cn(
        'flex w-full gap-8',
        type === 'row' ? 'flex-row' : 'flex-col',
      )}
    >
      <Skeleton
        className={cn(
          'aspect-video rounded-lg',
          type === 'row' ? 'w-1/3 sm:w-1/2' : 'h-[180px] w-full',
        )}
      />
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-5 w-full max-w-lg" />
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </article>
  );
};
