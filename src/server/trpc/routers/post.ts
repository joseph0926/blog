import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { updatePostSchema } from '@/schemas/post.schema';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const updatePostOutput = z.object({
  post: z.object({
    slug: z.string(),
    thumbnail: z.string(),
    updatedAt: z.date(),
  }),
  message: z.string(),
});

export const postRouter = router({
  getTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.prisma.tag.findMany();
    return {
      tags,
      message: '태그를 불러왔습니다.',
    };
  }),

  update: protectedProcedure
    .input(
      z.object({
        slug: z.string(),
        payload: updatePostSchema,
      }),
    )
    .output(updatePostOutput)
    .mutation(async ({ ctx, input }) => {
      const { slug, payload } = input;

      try {
        const post = await ctx.prisma.post.update({
          where: { slug },
          data: { thumbnail: payload.thumbnail },
          select: { slug: true, thumbnail: true, updatedAt: true },
        });
        if (!post.thumbnail) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '썸네일 업데이트 실패',
          });
        }

        await Promise.all([
          revalidateTag('posts'),
          revalidateTag(`post-${slug}`),
        ]);

        return {
          post: {
            ...post,
            thumbnail: post.thumbnail,
          },
          message: '글을 업데이트하였습니다.',
        };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: '해당 글이 없습니다.',
            });
          }
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 업데이트하는 중 오류가 발생했습니다.',
        });
      }
    }),
});
