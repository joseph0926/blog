import { Metadata } from 'next';
import { Suspense } from 'react';
import { getPostBySlug } from '@/actions/post/getPostBySlug.action';
import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostContent } from '@/components/post/post-content';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { commonOpenGraph } from '@/meta/open-graph';

export const dynamic = 'force-static';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data } = await getPostBySlug(slug);
  const post = data?.post;

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
    title: post.title,
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

  return (
    <Container as="main" size="lg" className="relative">
      <Suspense fallback={<PostHeaderLoading />}>
        <PostHeader slug={slug} />
      </Suspense>
      <article className="prose dark:prose-invert max-w-none py-8">
        <Suspense fallback={<div className="h-[67vh]" />}>
          <PostContent slug={slug} />
        </Suspense>
      </article>
    </Container>
  );
}
