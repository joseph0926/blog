import { Metadata } from 'next';
import { Suspense } from 'react';
import { BlogListServer } from '@/components/blog/blog-list.server';
import { BlogPostSkeleton } from '@/components/home/blog-post.skeleton';
import { Container } from '@/components/ui/container';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    '프론트엔드 개발, React, TypeScript, 웹 성능 최적화에 대한 기술 블로그입니다. 실무 경험과 학습 내용을 공유합니다.',
  keywords: [
    '기술 블로그',
    '프론트엔드 개발',
    'React 블로그',
    'TypeScript 블로그',
    'Next.js 튜토리얼',
    '웹 개발 블로그',
    '김영훈 블로그',
    'joseph0926',
  ],
  openGraph: {
    ...commonOpenGraph,
    title: 'Blog - 김영훈 | 프론트엔드 기술 블로그',
    description:
      '프론트엔드 개발, React, TypeScript, 웹 성능 최적화에 대한 기술 블로그입니다.',
    url: 'https://www.joseph0926.com/blog',
    type: 'website',
    images: [
      {
        url: 'https://www.joseph0926.com/logo/logo.webp',
        width: 1200,
        height: 630,
        alt: '김영훈 기술 블로그',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - 김영훈 | 프론트엔드 기술 블로그',
    description: '프론트엔드 개발, React, TypeScript에 대한 기술 블로그입니다.',
    images: ['/logo/logo.webp'],
  },
  alternates: {
    canonical: 'https://www.joseph0926.com/blog',
  },
  robots: pageRobots.blogList,
};

export default function BlogPage() {
  return (
    <Container as="section" size="md" className="relative min-h-[70vh]">
      <Suspense
        fallback={
          <div className="grid h-full w-full grid-cols-1 gap-x-4 gap-y-8 py-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <BlogPostSkeleton type="col" key={idx} />
            ))}
          </div>
        }
      >
        <BlogListServer />
      </Suspense>
    </Container>
  );
}
