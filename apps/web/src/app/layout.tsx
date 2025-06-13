import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { cn } from '@blog/ui/lib/utils';
import { commonOpenGraph } from '@/meta/open-graph';
import { ThemeProvider } from '@/providers/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://joseph0926.com'),
  title: {
    default: '김영훈 블로그',
    template: '%s | 김영훈 블로그',
  },
  description:
    '프론트엔드 개발자 김영훈의 블로그입니다. React, 웹 성능 최적화, 최신 개발 기술 및 경험을 공유합니다.',
  openGraph: commonOpenGraph,
  twitter: {
    card: 'summary_large_image',
    title: '김영훈 블로그',
    description:
      '프론트엔드 개발자 김영훈의 블로그입니다. React, 웹 성능 최적화, 최신 개발 기술 및 경험을 공유합니다.',
    images: ['/logo/logo.webp'],
  },
  icons: {
    icon: '/logo/logo.svg',
  },
  keywords: [
    '김영훈',
    '프론트엔드',
    'React',
    '웹 개발',
    '웹 성능 최적화',
    '개발 블로그',
    'TypeScript',
    'Next.js',
  ],
  authors: [{ name: '김영훈', url: 'https://joseph0926.com' }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={cn(geistSans.variable, geistMono.variable, 'antialiased')}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors closeButton position="top-center" />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
