import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';

export default function PostPage() {
  return (
    <Container as="main" size="lg" className="relative">
      <PostHeader />
    </Container>
  );
}
