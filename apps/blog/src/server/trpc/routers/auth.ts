import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { deleteAdminCookie, setAdminCookie } from '@/lib/auth/cookie';
import { createAdminToken } from '@/lib/auth/token';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const authRouter = router({
  login: publicProcedure
    .input(
      z.object({
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { password } = input;

        const isAdmin = password === process.env.ADMIN_PASSWORD;
        if (!isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '인증 정보가 잘못되었습니다.',
          });
        }

        const token = await createAdminToken();
        await setAdminCookie(token);

        return {
          message: '로그인에 성공했습니다.',
        };
      } catch (e) {
        if (e instanceof TRPCError) {
          throw e;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '로그인 중 오류가 발생했습니다.',
        });
      }
    }),

  logout: protectedProcedure.mutation(async () => {
    try {
      await deleteAdminCookie();

      return {
        message: '로그아웃이 되었습니다.',
      };
    } catch (e) {
      if (e instanceof TRPCError) {
        throw e;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    }
  }),
});
