import { type NextRequest } from 'next/server';

export async function createTRPCContext({
  req,
}: {
  headers: Headers;
  req?: NextRequest;
}) {
  return {
    user: null,
    req,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
