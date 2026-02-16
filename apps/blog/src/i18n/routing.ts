import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];

export const appLocales = [...routing.locales] as AppLocale[];
export const defaultLocale = routing.defaultLocale as AppLocale;

export const isAppLocale = (value: string): value is AppLocale =>
  appLocales.includes(value as AppLocale);
