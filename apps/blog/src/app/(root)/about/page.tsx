import { Metadata } from 'next';
import { TerminalAbout } from '@/components/about/terminal-about';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';

export const metadata: Metadata = {
  title: 'About',
  description:
    '프론트엔드 개발자 김영훈입니다. React와 TypeScript를 주로 사용하며, 웹 성능 최적화와 사용자 경험 개선에 관심이 많습니다.',
  keywords: [
    '김영훈',
    '프론트엔드 개발자',
    'React 개발자',
    'TypeScript',
    'Next.js',
    '웹 성능 최적화',
    'joseph0926',
    '포트폴리오',
    '이력서',
  ],
  openGraph: {
    ...commonOpenGraph,
    title: 'About - 김영훈 | 프론트엔드 개발자',
    description:
      'React와 TypeScript를 주로 사용하는 프론트엔드 개발자입니다. 웹 성능 최적화와 사용자 경험 개선에 열정을 가지고 있습니다.',
    url: 'https://www.joseph0926.com/about',
    type: 'profile',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - 김영훈 | 프론트엔드 개발자',
    description: 'React와 TypeScript를 주로 사용하는 프론트엔드 개발자입니다.',
    images: ['/logo/logo.webp'],
  },
  alternates: {
    canonical: 'https://www.joseph0926.com/about',
  },
  robots: pageRobots.about,
};

export default function AboutPage() {
  return <TerminalAbout />;
}
