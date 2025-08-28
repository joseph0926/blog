import 'server-only';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';
import { createTRPCContext } from './context';
import { makeQueryClient } from './query-client';
import { appRouter } from './root';
import { createCallerFactory } from './trpc';

export const getQueryClient = cache(makeQueryClient);
const ctx = await createTRPCContext({ headers: new Headers() });
const createCaller = createCallerFactory(appRouter);

const caller = createCaller(ctx);
export const { trpc: serverTrpc, HydrateClient } = createHydrationHelpers<
  typeof appRouter
>(caller, getQueryClient);
