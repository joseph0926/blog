'use client';

import { ArrowRight, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { type FormEvent, useEffect, useRef } from 'react';
import { getPathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import styles from './question-dial.module.css';

export function HomeSearch() {
  const t = useTranslations('home');
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const isEditing =
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, [contenteditable]');
      if (
        event.key !== '/' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditing
      )
        return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const search = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = inputRef.current?.value.trim() ?? '';
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/blog${query ? `?${params}` : ''}`);
  };

  return (
    <form
      role="search"
      aria-label={t('searchLabel')}
      action={getPathname({ locale, href: '/blog' })}
      onSubmit={search}
      className={styles.search}
    >
      <Search aria-hidden="true" size={17} />
      <input
        ref={inputRef}
        type="search"
        name="q"
        aria-label={t('searchLabel')}
        aria-keyshortcuts="/"
        placeholder={t('searchPlaceholder')}
        autoComplete="off"
      />
      <kbd aria-hidden="true">/</kbd>
      <button type="submit" aria-label={t('searchSubmit')}>
        <ArrowRight aria-hidden="true" size={18} />
      </button>
    </form>
  );
}
