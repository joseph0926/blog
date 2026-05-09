'use client';

export const RecentBlogPostsLoading = () => {
  return (
    <div className="border-border/70 border-b" role="status" aria-busy="true">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="grid gap-4 border-t py-5 sm:grid-cols-[5.5rem_1fr_auto]"
        >
          <div className="space-y-2">
            <div className="bg-muted h-3 w-12 rounded-sm" />
            <div className="bg-muted h-3 w-10 rounded-sm" />
          </div>
          <div className="space-y-3">
            <div className="bg-muted h-5 w-4/5 rounded-sm" />
            <div className="bg-muted h-4 w-full max-w-2xl rounded-sm" />
            <div className="bg-muted h-3 w-32 rounded-sm" />
          </div>
          <div className="bg-muted h-3 w-20 rounded-sm" />
        </div>
      ))}
    </div>
  );
};
