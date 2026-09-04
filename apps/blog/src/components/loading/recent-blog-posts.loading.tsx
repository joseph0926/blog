export const RecentBlogPostsLoading = () => {
  return (
    <div className="border-rule border-b" role="status" aria-busy="true">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="border-rule grid gap-2 border-t py-6 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6"
        >
          <div className="flex gap-3 sm:flex-col sm:gap-1">
            <div className="skeleton-shimmer h-3 w-14 rounded-sm" />
            <div className="skeleton-shimmer h-3 w-20 rounded-sm" />
          </div>
          <div className="space-y-3">
            <div className="skeleton-shimmer h-5 w-4/5 rounded-sm" />
            <div className="skeleton-shimmer h-4 w-full max-w-[68ch] rounded-sm" />
            <div className="skeleton-shimmer h-3 w-32 rounded-sm" />
          </div>
          <div className="skeleton-shimmer h-3 w-16 rounded-sm" />
        </div>
      ))}
    </div>
  );
};
