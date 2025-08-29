import { type NextRequest } from 'next/server';
import { getAdminCookie } from '@/lib/auth/cookie';
import { verifyAccessToken } from '@/lib/auth/token';
import { prisma } from '@/lib/prisma';

export async function createTRPCContext({
  req,
}: {
  headers: Headers;
  req?: NextRequest;
}) {
  const token = await getAdminCookie();

  let user = null;

  if (token) {
    try {
      const result = await verifyAccessToken(token);
      if (result.isAdmin) {
        user = { isAdmin: true };
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  return {
    prisma,
    user,
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
