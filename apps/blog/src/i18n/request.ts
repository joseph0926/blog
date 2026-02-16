import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isAppLocale } from './routing';

const messageLoaders = {
  ko: () => import('../../messages/ko.json'),
  en: () => import('../../messages/en.json'),
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && isAppLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  };
});
