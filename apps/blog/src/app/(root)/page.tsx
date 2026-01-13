import { Suspense } from 'react';
import { AllBlogPosts } from '@/components/home/all-blog-posts';
import { HeroSection } from '@/components/home/hero-section';
import { RecentBlogPosts } from '@/components/home/recent-blog-posts';
import { AllBlogPostsLoading } from '@/components/loading/all-blog-posts.loading';
import { RecentBlogPostsLoading } from '@/components/loading/recent-blog-posts.loading';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Container as="main" size="lg" className="mt-24 space-y-24">
        <section>
          <SectionHeading title="Recent" description="Latest posts" />
          <Suspense fallback={<RecentBlogPostsLoading />}>
            <RecentBlogPosts />
          </Suspense>
        </section>
        <section>
          <SectionHeading title="Archive" description="All posts" />
          <Suspense fallback={<AllBlogPostsLoading />}>
            <AllBlogPosts />
          </Suspense>
        </section>
      </Container>
    </>
  );
}
