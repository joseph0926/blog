import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { revalidateTag, unstable_cache } from 'next/cache';
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
  getPostBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/, {
          message: '잘못된 글 주소입니다.',
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { slug } = input;

      let cacheHit = true;

      const cachedFn = unstable_cache(
        async () => {
          cacheHit = false;

          const post = await ctx.prisma.post.findUnique({
            where: { slug },
          });

          if (!post) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `${slug}에 해당하는 글을 찾을 수 없습니다.`,
            });
          }

          return post;
        },
        ['post', slug],
        {
          tags: [`post-${slug}`],
          revalidate: 3600,
        },
      );

      try {
        const post = await cachedFn();

        return {
          post,
          message: '글을 불러왔습니다.',
          cacheHit,
        };
      } catch (e) {
        if (e instanceof TRPCError) {
          throw e;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

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
