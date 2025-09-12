import { Skeleton } from '@joseph0926/ui/components/skeleton';

export const RecentBlogPostsLoading = () => {
  return (
    <>
      <section className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-y-12">
          {[1, 2].map((idx) => (
            <div key={idx} className="flex gap-4">
              <Skeleton className="aspect-video w-1/3 rounded-lg sm:w-1/2" />
              <div className="flex w-full flex-col gap-3">
                <Skeleton className="h-5 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="mt-12 flex gap-4">
        <Skeleton className="aspect-video w-1/3 rounded-lg sm:w-1/2" />
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-5 w-2/3 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
};
