import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { appLocales, isAppLocale } from '@/i18n/routing';

const messageLoaders = {
  ko: () => import('../../../messages/ko.json'),
  en: () => import('../../../messages/en.json'),
} as const;

export function generateStaticParams() {
  return appLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = (await messageLoaders[locale]()).default;

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
