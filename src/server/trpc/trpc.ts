import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const isAuth = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.user.isAdmin) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: '관리자 권한이 필요합니다.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuth);
