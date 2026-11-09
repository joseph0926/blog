'use client';

import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { type ComponentProps, useSyncExternalStore } from 'react';
import { getPathname, Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

// 링크를 눌러 들어온 경우만 기억한다. 새 탭이나 직접 방문은 목록 링크를 쓴다.
type PostOrigin = { href: string; entryKey?: string };
const origins = new Map<string, PostOrigin>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const serverOrigin = () => null;

export function rememberPostOrigin(slug: string) {
  origins.set(slug, {
    href:
      window.location.pathname + window.location.search + window.location.hash,
    entryKey: window.navigation?.currentEntry?.key,
  });
  listeners.forEach((listener) => listener());
}

export function PostLink({
  postSlug,
  onNavigate,
  ...props
}: ComponentProps<typeof Link> & { postSlug: string }) {
  return (
    <Link
      {...props}
      onNavigate={(event) => {
        rememberPostOrigin(postSlug);
        onNavigate?.(event);
      }}
    />
  );
}

export function PostReturnLink({
  postSlug,
  className,
}: {
  postSlug: string;
  className?: string;
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const origin = useSyncExternalStore(
    subscribe,
    () => origins.get(postSlug) ?? null,
    serverOrigin,
  );
  const label = origin
    ? locale === 'ko'
      ? '돌아가기'
      : 'Back'
    : locale === 'ko'
      ? '모든 글'
      : 'All posts';

  return (
    <NextLink
      href={origin?.href ?? getPathname({ locale, href: '/blog' })}
      className={className}
      onNavigate={(event) => {
        const navigation = window.navigation;
        if (
          origin?.entryKey &&
          typeof navigation?.traverseTo === 'function' &&
          navigation.entries().some((entry) => entry.key === origin.entryKey)
        ) {
          event.preventDefault();
          try {
            const result = navigation.traverseTo(origin.entryKey);
            result.committed?.catch(() => {});
            if (!result.finished) {
              router.push(origin.href);
              return;
            }
            result.finished.catch((error: unknown) => {
              if (error instanceof DOMException && error.name === 'AbortError')
                return;
              router.push(origin.href);
            });
          } catch {
            router.push(origin.href);
          }
        }
      }}
    >
      <ArrowLeft aria-hidden="true" size={16} />
      {label}
    </NextLink>
  );
}
