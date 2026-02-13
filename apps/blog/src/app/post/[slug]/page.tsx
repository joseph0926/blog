import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostContent } from '@/components/post/post-content';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { getAllPostSlugs, getPostContent } from '@/services/post.service';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await createTRPCContext({ headers: new Headers() });

  try {
    const { post } = await appRouter
      .createCaller(ctx)
      .post.getPostBySlug({ slug });
    const keywords = post.tags.map((tag) => tag.name);

    return {
      title: post.title,
      description: post.description,
      openGraph: {
        ...commonOpenGraph,
        title: post.title,
        description: post.description,
        url: `https://www.joseph0926.com/post/${slug}`,
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
  } catch {
    return {
      title: '김영훈 블로그',
      description: '프론트엔드 개발자 김영훈의 블로그입니다',
      openGraph: commonOpenGraph,
      icons: { icon: '/logo/logo.svg' },
      robots: pageRobots.blogPost,
    };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    await getPostContent(slug);
  } catch {
    notFound();
  }

  return (
    <Container as="main" size="lg" className="relative">
      <Suspense fallback={<PostHeaderLoading />}>
        <PostHeader slug={slug} />
      </Suspense>
      <article className="prose dark:prose-invert prose-pre:rounded-xl prose-pre:border prose-pre:border-border/70 prose-pre:bg-muted/55 prose-pre:shadow-xs dark:prose-pre:border-white/20 dark:prose-pre:bg-black/35 max-w-none py-8">
        <Suspense
          fallback={
            <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          }
        >
          <PostContent slug={slug} />
        </Suspense>
      </article>
    </Container>
  );
}
