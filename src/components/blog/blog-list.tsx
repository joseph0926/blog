'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { BookX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { getPosts } from '@/actions/post/getPosts.action';
import { QUERY_KEY } from '@/lib/query-key';
import { BlogPost } from '../home/blog-post';
import { BlogPostSkeleton } from '../home/blog-post.skeleton';

export const BlogList = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') ?? undefined;

  const divRef = useRef<HTMLDivElement>(null);

  const { data, isPending, isFetching, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: QUERY_KEY.POST.ALL({ category }),
      queryFn: ({ pageParam = undefined }: { pageParam: string | undefined }) =>
        getPosts({ limit: 10, cursor: pageParam, filter: { category } }),
      getNextPageParam: (lastPage) => {
        const cursor = lastPage.data?.cursor;
        if (cursor) {
          return cursor;
        }

        return undefined;
      },
      initialPageParam: undefined,
      staleTime: 1000 * 60 * 5,
    });

  const posts = useMemo(
    () => data?.pages.flatMap((p) => p.data?.posts ?? []) ?? [],
    [data],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isPending && !isFetching) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.5,
      },
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, [divRef, hasNextPage, isPending, isFetching]);

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-x-4 gap-y-8 py-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <BlogPostSkeleton type="col" key={index} />
        ))}
      </div>
    );
  }
  if (!isPending && !isFetching && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center">
        <BookX className="size-10" />
        <p className="text-sm font-semibold">블로그 글이 존재하지 않습니다.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 py-4 sm:grid-cols-2 md:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            layout
            layoutId={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              layout: {
                type: 'spring',
                stiffness: 120,
                damping: 28,
                mass: 0.9,
              },
              opacity: { duration: 0.2 },
            }}
            whileHover={{ scale: 1.02 }}
          >
            <BlogPost post={post} type="col" />
          </motion.div>
        ))}
      </AnimatePresence>
      {hasNextPage && !isFetching ? <div className="h-1" ref={divRef} /> : null}
      {!isPending && isFetching && <BlogPostSkeleton type="col" />}
    </div>
  );
};
