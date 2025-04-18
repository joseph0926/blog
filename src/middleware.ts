import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
} from '@/lib/auth/token';

export const config = {
  matcher: ['/admin/:path*'],
};

export async function middleware(req: NextRequest) {
  const access = req.cookies.get('accessToken')?.value;
  const refresh = req.cookies.get('refreshToken')?.value;

  try {
    if (access) {
      await verifyAccessToken(access);
      return NextResponse.next();
    }

    if (refresh) {
      const { userId } = await verifyRefreshToken(refresh);
      const newAccess = await signAccessToken(userId);

      const res = NextResponse.next();
      res.cookies.set({
        name: 'accessToken',
        value: newAccess,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
      return res;
    }
  } catch (err) {
    console.error('[Auth Middleware]', err);
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/sign-in';
  loginUrl.searchParams.set('from', req.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}
