import type { Metadata } from 'next';
import type { AppLocale } from './routing';

const BASE_URL = 'https://www.joseph0926.com';

const trimTrailingSlash = (value: string) =>
  value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;

export const localizedPath = (locale: AppLocale, path = '/') => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const cleaned = trimTrailingSlash(normalized);

  if (locale === 'ko') {
    return cleaned === '' ? '/' : cleaned;
  }

  return cleaned === '/' ? '/en' : `/en${cleaned}`;
};

export const toAbsoluteUrl = (path: string) =>
  new URL(path, BASE_URL).toString();

export const getAlternates = (
  locale: AppLocale,
  path = '/',
): Metadata['alternates'] => {
  const koPath = localizedPath('ko', path);
  const enPath = localizedPath('en', path);

  return {
    canonical: toAbsoluteUrl(localizedPath(locale, path)),
    languages: {
      ko: toAbsoluteUrl(koPath),
      en: toAbsoluteUrl(enPath),
      'x-default': toAbsoluteUrl(koPath),
    },
  };
};

export const getOpenGraphLocale = (locale: AppLocale) =>
  locale === 'en' ? 'en_US' : 'ko_KR';
