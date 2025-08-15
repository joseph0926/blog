import { publicProcedure, router } from '../trpc';

export const postRouter = router({
  getTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany();

    return {
      tags,
      message: '태그를 불러왔습니다.',
    };
  }),
});
