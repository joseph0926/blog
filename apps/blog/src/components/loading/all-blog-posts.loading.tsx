export const AllBlogPostsLoading = () => {
  return (
    <div
      className="grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10"
      role="status"
      aria-busy="true"
    >
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="skeleton-shimmer h-4 w-16 rounded-sm" />
        ))}
      </div>
      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, groupIdx) => (
          <div key={groupIdx}>
            <div className="skeleton-shimmer mb-3 h-5 w-14 rounded-sm" />
            <div className="border-rule border-b">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border-rule flex items-center gap-4 border-t py-3"
                >
                  <div className="skeleton-shimmer h-3 w-14 rounded-sm" />
                  <div className="skeleton-shimmer h-4 flex-1 rounded-sm" />
                  <div className="skeleton-shimmer h-3 w-10 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
