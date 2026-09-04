import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import type { AppLocale } from '@/i18n/routing';

const getDateLocale = (locale: AppLocale) => (locale === 'ko' ? ko : enUS);

export const formatPostDate = (date: Date | string, locale: AppLocale) =>
  format(new Date(date), locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd, yyyy', {
    locale: getDateLocale(locale),
  });

export const formatPostMonthDay = (date: Date | string, locale: AppLocale) =>
  format(new Date(date), locale === 'ko' ? 'MM.dd' : 'MMM dd', {
    locale: getDateLocale(locale),
  });

export const formatReadTime = (minutes: number, locale: AppLocale) =>
  locale === 'ko' ? `${minutes}분 읽기` : `${minutes} min read`;

export const formatEntryNumber = (entryNumber: number) =>
  `No. ${String(Math.max(entryNumber, 0)).padStart(3, '0')}`;
