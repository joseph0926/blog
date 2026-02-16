import { Suspense } from 'react';
import { BlogFilterServer } from '@/components/blog/blog-filter.server';
import { BlogFilterSkeleton } from '@/components/blog/blog-filter.skeleton';
import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';
import { defaultLocale, isAppLocale } from '@/i18n/routing';

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : defaultLocale;

  return (
    <>
      <Header />
      <Suspense fallback={<BlogFilterSkeleton />}>
        <BlogFilterServer locale={safeLocale} />
      </Suspense>
      <main>{children}</main>
      <Footer locale={safeLocale} />
    </>
  );
}
