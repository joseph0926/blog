import { Skeleton } from '@joseph0926/ui/components/skeleton';

export const AllBlogPostsLoading = () => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Skeleton key={idx} className="h-[200px] w-full rounded-lg" />
      ))}
    </>
  );
};
