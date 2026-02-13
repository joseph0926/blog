import { Skeleton } from '@joseph0926/ui/components/skeleton';

export const BlogFilterSkeleton = () => {
  return (
    <div className="border-border/70 bg-background/80 sticky top-14 z-20 border-b backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="from-background via-background to-muted/35 border-border/70 rounded-xl border bg-linear-to-br p-3 shadow-xs md:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-9 w-24 md:hidden" />
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <Skeleton className="h-9 w-full md:h-10" />
            <Skeleton className="hidden h-9 w-16 md:block md:h-10" />
          </div>

          <div className="mt-3 hidden flex-wrap gap-2 md:flex">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
