import { Skeleton } from '@joseph0926/ui/components/skeleton';

export const BlogFilterSkeleton = () => {
  return (
    <div className="border-border bg-background/80 sticky top-14 z-20 border-b backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden items-center gap-6 md:flex">
            <Skeleton className="h-6 w-8" />
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-6 w-16" />
            ))}
          </div>

          <Skeleton className="h-9 w-24 md:hidden" />

          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-9 w-48 md:block" />
          </div>
        </div>
      </div>
    </div>
  );
};
