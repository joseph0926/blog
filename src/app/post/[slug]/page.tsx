import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { getPostContent } from '@/services/post.service';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { Suspense } from 'react';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { source } = await getPostContent(slug);

  return (
    <Container as="main" size="lg" className="relative">
      <Suspense fallback={<PostHeaderLoading />}>
        <PostHeader slug={slug} />
      </Suspense>
      <MDXRemote source={source} />
    </Container>
  );
}
