import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { type NextRequest } from 'next/server';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
        req,
      }),
  });

export { handler as GET, handler as POST };
