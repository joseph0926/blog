import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function createTRPCContext({
  req,
}: {
  headers: Headers;
  req?: NextRequest;
}) {
  const user = null;

  return {
    prisma,
    user,
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
