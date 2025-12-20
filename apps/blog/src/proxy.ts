import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return new TextEncoder().encode(secret);
};

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Proxy checking path:', pathname);

  if (pathname === '/login') {
    console.log('Login page - allowing access');
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
    } catch (error) {
      console.error('Admin auth failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
