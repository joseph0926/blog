import '@joseph0926/ui/globals.css';
import { cn } from '@joseph0926/ui/lib/utils';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { Toaster } from 'sonner';
import { commonOpenGraph } from '@/meta/open-graph';
import { getRobotsByEnvironment } from '@/meta/robots';
import ReactQueryProvider from '@/providers/react-query-provider';
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
  metadataBase: new URL('https://www.joseph0926.com'),
  title: {
    default: '김영훈 블로그',
    template: '%s | 김영훈 블로그',
  },
  description:
    '프론트엔드 개발자 김영훈의 블로그입니다. React, 웹 성능 최적화, 최신 개발 기술 및 경험을 공유합니다.',
  openGraph: commonOpenGraph,
  robots: getRobotsByEnvironment(),
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
    '김영훈 프론트엔드',
    '프론트엔드 김영훈',
    'React',
    '웹 개발',
    '웹 성능 최적화',
    '개발 블로그',
    'TypeScript',
    'Next.js',
    'joseph0926',
  ],
  authors: [{ name: '김영훈', url: 'https://www.joseph0926.com' }],
};

const isVercel = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale().catch(() => 'ko');
  const htmlLang = locale === 'en' ? 'en' : 'ko';

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body
        className={cn(geistSans.variable, geistMono.variable, 'antialiased')}
      >
        {/* Accessibility: Skip to main content link */}
        <a href="#main-content" className="skip-link">
          본문으로 건너뛰기
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster richColors closeButton position="top-center" />
          <ReactQueryProvider>
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
          </ReactQueryProvider>
          {isVercel && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
