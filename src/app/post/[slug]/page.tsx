import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { default: Post } = await import(`@/mdx/${slug}.mdx`);

  return (
    <Container as="main" size="lg" className="relative">
      <PostHeader />
    </Container>
  );
}
