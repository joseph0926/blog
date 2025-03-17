import { AllBlogPosts } from '@/components/home/all-blog-posts';
import { RecentBlogPosts } from '@/components/home/recent-blog-posts';
import { Container } from '@/components/ui/container';

export default function HomePage() {
  return (
    <Container as="main" size="lg" className="mt-16 flex flex-col gap-8">
      <h1 className="text-3xl font-semibold">Recent blog posts</h1>
      <RecentBlogPosts />
      <h1 className="text-3xl font-semibold">All blog posts</h1>
      <AllBlogPosts />
    </Container>
  );
}
