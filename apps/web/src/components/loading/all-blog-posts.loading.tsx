import { Skeleton } from '@blog/ui/components/ui/skeleton';

export const AllBlogPostsLoading = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Skeleton key={idx} className="h-[200px] w-full rounded-lg" />
      ))}
    </>
  );
};
