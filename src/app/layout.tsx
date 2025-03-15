import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { commonOpenGraph } from '@/meta/open-graph';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '김영훈 블로그',
  description: '프론트엔드 개발자 김영훈의 블로그입니다',
  openGraph: commonOpenGraph,
  icons: {
    icon: '/logo/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
