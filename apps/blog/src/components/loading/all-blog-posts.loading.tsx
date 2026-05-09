'use client';

export const AllBlogPostsLoading = () => {
  return (
    <div
      className="border-border/70 grid overflow-hidden rounded-md border lg:grid-cols-[16rem_1fr]"
      role="status"
      aria-busy="true"
    >
      <div className="border-border/70 bg-muted/20 space-y-4 border-b p-5 lg:border-r lg:border-b-0">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="bg-muted h-4 w-12 rounded-sm" />
            <div className="bg-muted h-3 w-6 rounded-sm" />
          </div>
        ))}
      </div>
      <div className="divide-border/70 divide-y p-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="grid gap-3 py-4 sm:grid-cols-[6rem_1fr_auto]"
          >
            <div className="bg-muted h-3 w-20 rounded-sm" />
            <div className="bg-muted h-4 w-full rounded-sm" />
            <div className="bg-muted h-3 w-16 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};
