import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { isAppLocale, routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const localePrefixPattern = /^\/(ko|en)(\/|$)/;

const getCountryCode = (request: NextRequest) => {
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry');

  return country?.trim().toUpperCase() || null;
};

const getPreferredLocaleFromCookie = (request: NextRequest) => {
  const locale = request.cookies.get('NEXT_LOCALE')?.value;
  if (!locale || !isAppLocale(locale)) {
    return null;
  }
  return locale;
};

const shouldRedirectToEnglish = ({
  pathname,
  preferredLocale,
  countryCode,
}: {
  pathname: string;
  preferredLocale: 'ko' | 'en' | null;
  countryCode: string | null;
}) => {
  if (localePrefixPattern.test(pathname)) {
    return false;
  }

  if (preferredLocale) {
    return preferredLocale === 'en';
  }

  if (!countryCode) {
    return false;
  }

  return countryCode !== 'KR';
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const preferredLocale = getPreferredLocaleFromCookie(request);
  const countryCode = getCountryCode(request);

  if (
    shouldRedirectToEnglish({
      pathname,
      preferredLocale,
      countryCode,
    })
  ) {
    const localizedPathname = pathname === '/' ? '/en' : `/en${pathname}`;
    const redirectUrl = `${localizedPathname}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
