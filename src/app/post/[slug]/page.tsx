import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { getPostContent } from '@/services/post.service';
import { compileMDX } from 'next-mdx-remote/rsc';
import { Suspense } from 'react';
import { StackReconciler, FiberWrapper } from '@/mdx/components';

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { source } = await getPostContent(slug);

  const { content } = await compileMDX({
    source,
    components: { StackReconciler, FiberWrapper },
    options: { parseFrontmatter: true },
  });

  return (
    <Container as="main" size="lg" className="relative">
      <Suspense fallback={<PostHeaderLoading />}>
        <PostHeader slug={slug} />
      </Suspense>
      <article className="prose dark:prose-invert max-w-none py-8">
        {content}
      </article>
    </Container>
  );
}
