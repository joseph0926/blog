import { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogFilterServer } from '@/components/blog/blog-filter.server';
import { BlogFilterSkeleton } from '@/components/blog/blog-filter.skeleton';
import { BlogListServer } from '@/components/blog/blog-list.server';
import { BlogPostSkeleton } from '@/components/home/blog-post.skeleton';
import { Container } from '@/components/ui/container';

export const metadata: Metadata = {
  title: 'Blogs',
  description: '작성된 블로그 글 전체를 확인해보세요!',
};

export default function BlogPage() {
  return (
    <Container as="section" size="md" className="relative min-h-[70vh]">
      <Suspense
        fallback={
          <div className="grid h-full w-full grid-cols-1 gap-x-4 gap-y-8 py-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <BlogPostSkeleton type="col" key={idx} />
            ))}
          </div>
        }
      >
        <BlogListServer />
      </Suspense>
    </Container>
  );
}
