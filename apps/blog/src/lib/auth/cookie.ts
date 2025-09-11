import { cookies } from 'next/headers';

const COOKIE_NAME = 'kyh-admin-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export async function getAdminCookie() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  return cookie?.value;
}

export async function deleteAdminCookie() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function hasAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.has(COOKIE_NAME);
}
