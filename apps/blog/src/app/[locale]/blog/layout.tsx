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
      <main>{children}</main>
      <Footer locale={safeLocale} />
    </>
  );
}
