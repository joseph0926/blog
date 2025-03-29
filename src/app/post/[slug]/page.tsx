import { Metadata, ResolvingMetadata } from 'next';
import { compileMDX } from 'next-mdx-remote/rsc';
import { Suspense } from 'react';
import { getPostBySlug } from '@/actions/post.action';
import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { FiberWrapper, StackReconciler } from '@/mdx/components';
import { commonOpenGraph } from '@/meta/open-graph';
import { getPostContent } from '@/services/post.service';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: post } = await getPostBySlug(slug);
  if (!post) {
    return {
      title: '김영훈 블로그',
      description: '프론트엔드 개발자 김영훈의 블로그입니다',
      openGraph: commonOpenGraph,
      icons: {
        icon: '/logo/logo.svg',
      },
    };
  }

  return {
    title: `김영훈 블로그 | ${post.title}`,
    description: post.description,
    openGraph: {
      ...commonOpenGraph,
      images: post?.thumbnail
        ? [
            {
              url: post.thumbnail,
              width: 1200,
              height: 630,
              alt: `${post.title} 이미지`,
            },
          ]
        : commonOpenGraph?.images,
    },
  };
}

export default async function PostPage({ params }: Props) {
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
