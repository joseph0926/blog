import { Footer } from '@/components/home/footer';
import { Header } from '@/components/layouts/header';
import { TopProgress } from '@/components/ui/top-progress';
import { defaultLocale, isAppLocale } from '@/i18n/routing';

export default async function PostLayout({
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
      <TopProgress />
      <Header useTitle={false} />
      {children}
      <Footer locale={safeLocale} />
    </>
  );
}
