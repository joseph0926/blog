'use client';

import { BookX } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { BlogPostCard } from './blog-post-card';

export const BlogList = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? undefined;
  const search = searchParams.get('q') ?? undefined;
  const divRef = useRef<HTMLDivElement>(null);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    trpc.post.getPosts.useInfiniteQuery(
      {
        limit: 10,
        filter: { category, search },
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 1000 * 60 * 5,
      },
    );

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  );

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const currentRef = divRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  if (posts.length === 0 && !isFetching) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <BookX className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">No posts found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your filters or check back later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
      {hasNextPage && <div className="h-1" ref={divRef} />}
      {isFetchingNextPage && (
        <div className="mt-8 flex justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}
    </div>
  );
};
