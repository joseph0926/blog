'use client';

import { BookX } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { BlogPostSkeleton } from '../home/blog-post.skeleton';
import { BlogPostCard } from './blog-post-card';

export const BlogList = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? undefined;
  const divRef = useRef<HTMLDivElement>(null);

  const { data, isPending, isFetching, hasNextPage, fetchNextPage } =
    trpc.post.getPosts.useInfiniteQuery(
      {
        limit: 10,
        filter: { category },
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isPending && !isFetching) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: '100px', threshold: 0.5 },
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, [divRef, hasNextPage, isPending, isFetching, fetchNextPage]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <BlogPostSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!isPending && !isFetching && posts.length === 0) {
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
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts[0] && (
            <BlogPostCard
              key={posts[0].id}
              post={posts[0]}
              featured={true}
              index={0}
            />
          )}
          {posts.slice(1).map((post, index) => (
            <BlogPostCard key={post.id} post={post} index={index + 1} />
          ))}
        </div>
      </AnimatePresence>
      {hasNextPage && !isFetching && <div className="h-1" ref={divRef} />}
      {!isPending && isFetching && (
        <div className="mt-8 text-center">
          <div className="border-primary inline-block h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      )}
    </div>
  );
};
