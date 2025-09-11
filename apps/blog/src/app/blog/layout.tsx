import { Suspense } from 'react';
import { BlogFilterServer } from '@/components/blog/blog-filter.server';
import { BlogFilterSkeleton } from '@/components/blog/blog-filter.skeleton';
import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Suspense fallback={<BlogFilterSkeleton />}>
        <BlogFilterServer />
      </Suspense>
      <main>{children}</main>
      <Footer />
    </>
  );
}
