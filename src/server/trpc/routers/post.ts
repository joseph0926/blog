import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { z } from 'zod';
import { updatePostSchema } from '@/schemas/post.schema';
import { createPost } from '@/services/post/create-post.service';
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
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        description: z.string().min(1),
        tags: z.array(z.string()),
        thumbnail: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await createPost(input, ctx.prisma);

        await Promise.all([
          revalidateTag('all-posts'),
          revalidateTag(`post-${post.slug}`),
        ]);

        return {
          post,
          message: '포스트가 성공적으로 생성되었습니다.',
        };
      } catch (e) {
        console.error(`tRPC createPost Error: ${e}`);

        if (e instanceof Error && e.message.includes('이미 존재하는 slug')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: e.message,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 생성하는 중 오류가 발생했습니다.',
        });
      }
    }),

  getPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().cuid().optional(),
        filter: z
          .object({
            category: z.string().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, filter } = input;
      const categoryFilter = filter?.category?.toLowerCase();

      const cacheKey = ['posts'];
      if (categoryFilter) {
        cacheKey.push(`cat:${categoryFilter}`);
      }
      cacheKey.push(`limit:${limit}`);
      if (cursor) {
        cacheKey.push(`cursor:${cursor}`);
      }

      let cacheHit = true;

      const cachedFn = unstable_cache(
        async () => {
          cacheHit = false;

          const posts = await ctx.prisma.post.findMany({
            select: {
              id: true,
              slug: true,
              title: true,
              thumbnail: true,
              createdAt: true,
              description: true,
              tags: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            where: categoryFilter
              ? { tags: { some: { name: categoryFilter } } }
              : undefined,
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            skip: 0,
            cursor: cursor ? { id: cursor } : undefined,
          });

          const hasMore = posts.length > limit;
          const slicedPosts = posts.slice(0, limit);
          const nextCursor = hasMore ? posts[limit]?.id : undefined;

          return {
            posts: slicedPosts,
            nextCursor,
          };
        },
        cacheKey,
        {
          tags: [
            'all-posts',
            ...(categoryFilter ? [`posts-category:${categoryFilter}`] : []),
          ],
          revalidate: cursor ? 60 : 300,
        },
      );

      try {
        const result = await cachedFn();

        return {
          posts: result.posts,
          nextCursor: result.nextCursor,
          message: result.posts.length
            ? '최신 글을 불러왔습니다.'
            : '글이 없습니다.',
          cacheHit,
        };
      } catch (error) {
        console.error('Error fetching posts:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

  getPostBySlug: publicProcedure
    .input(
      z.object({
        slug: z.preprocess(
          (val) => (typeof val === 'string' ? decodeURIComponent(val) : val),
          z.string().regex(/^[\p{L}\p{N}\-._~]+$/u, {
            message: '잘못된 글 주소입니다.',
          }),
        ),
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
        payload: z.object({
          title: z.string().min(1).max(100),
          description: z.string().min(1),
          tags: z.array(z.string()),
          thumbnail: z.string().optional(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { slug, payload } = input;

      try {
        const tagConnections = await Promise.all(
          payload.tags.map(async (tagName) => {
            const tag = await ctx.prisma.tag.upsert({
              where: { name: tagName },
              create: { name: tagName },
              update: {},
            });
            return { id: tag.id };
          }),
        );

        const post = await ctx.prisma.post.update({
          where: { slug },
          data: {
            title: payload.title,
            description: payload.description,
            thumbnail: payload.thumbnail || null,
            tags: {
              set: [],
              connect: tagConnections,
            },
          },
          select: {
            slug: true,
            title: true,
            description: true,
            thumbnail: true,
            updatedAt: true,
          },
        });

        await Promise.all([
          revalidateTag('all-posts'),
          revalidateTag(`post-${slug}`),
        ]);

        return {
          post,
          message: '글을 업데이트하였습니다.',
        };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
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
