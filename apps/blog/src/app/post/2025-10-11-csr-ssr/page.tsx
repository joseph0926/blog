import { Metadata } from 'next';
import { compileMDX } from 'next-mdx-remote/rsc';
import { Suspense } from 'react';
import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { getPostContent } from '@/services/post.service';

export const dynamic = 'force-static';

const SLUG = '2025-10-11-csr-ssr';

export async function generateMetadata(): Promise<Metadata> {
  const ctx = await createTRPCContext({ headers: new Headers() });

  try {
    const { post } = await appRouter
      .createCaller(ctx)
      .post.getPostBySlug({ slug: SLUG });
    const keywords = post.tags.map((tag) => tag.name);

    return {
      title: post.title,
      description: post.description,
      openGraph: {
        ...commonOpenGraph,
        title: post.title,
        description: post.description,
        url: `https://www.joseph0926.com/post/${SLUG}`,
        type: 'article',
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
      keywords,
      robots: pageRobots.blogPost,
    };
  } catch (e) {
    console.error(`Failed to fetch post: ${SLUG}`, e);
    return {
      title: '김영훈 블로그',
      description: '프론트엔드 개발자 김영훈의 블로그입니다',
      openGraph: commonOpenGraph,
      icons: { icon: '/logo/logo.svg' },
      robots: pageRobots.blogPost,
    };
  }
}

async function PostContent() {
  const { source } = await getPostContent(SLUG);

  const { content } = await compileMDX({
    source,
    components: {},
    options: { parseFrontmatter: true },
  });

  return content;
}

export default async function PostPage() {
  return (
    <Container as="main" size="lg" className="relative">
      <Suspense fallback={<PostHeaderLoading />}>
        <PostHeader slug={SLUG} />
      </Suspense>
      <article className="prose dark:prose-invert max-w-none py-8">
        <Suspense fallback={<div className="h-[67vh]" />}>
          <PostContent />
        </Suspense>
      </article>
    </Container>
  );
}
