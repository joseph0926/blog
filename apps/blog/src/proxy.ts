import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { isAppLocale, routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const localePrefixPattern = /^\/(ko|en)(\/|$)/;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return new TextEncoder().encode(secret);
};

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
  if (pathname === '/login' || pathname.startsWith('/admin')) {
    return false;
  }

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

  if (pathname === '/en/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/en/admin')) {
    const unlocalizedAdminPath = pathname.replace(/^\/en/, '');
    return NextResponse.redirect(new URL(unlocalizedAdminPath, request.url));
  }

  if (pathname === '/login') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    try {
      const token = request.cookies.get('kyh-admin-token')?.value;

      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const jwtSecret = getJwtSecret();
      await jwtVerify(token, jwtSecret, {
        algorithms: ['HS256'],
      });

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

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
