import type { Metadata } from 'next';

export const commonOpenGraph: Metadata['openGraph'] = {
  title: '김영훈 블로그',
  description: '프론트엔드 개발자 김영훈의 블로그입니다',
  url: 'https://yourdomain.com',
  siteName: '김영훈 블로그',
  images: [
    {
      url: '/logo/logo.webp',
      width: 1200,
      height: 630,
      alt: '김영훈 블로그 로고',
    },
  ],
  locale: 'ko_KR',
  type: 'website',
};
