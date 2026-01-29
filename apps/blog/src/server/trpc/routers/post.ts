import { TRPCError } from '@trpc/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { z } from 'zod';
import {
  getAllPosts,
  getAllTags,
  getPostBySlug as getPostBySlugFromMdx,
  updatePostMeta,
} from '@/services/post.service';
import { createPost } from '@/services/post/create-post.service';
import { protectedProcedure, publicProcedure, router } from '../trpc';

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
    .mutation(async ({ input }) => {
      try {
        const post = await createPost(input);

        await Promise.all([
          revalidateTag('all-posts', 'max'),
          revalidateTag(`post-${post.slug}`, 'max'),
        ]);

        return {
          post,
          message: '포스트가 성공적으로 생성되었습니다.',
        };
      } catch (e) {
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
        cursor: z.string().optional(),
        filter: z
          .object({
            category: z.string().optional(),
            search: z.string().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      const { limit, cursor, filter } = input;
      const categoryFilter = filter?.category?.toLowerCase();
      const searchFilter = filter?.search?.toLowerCase().trim();

      const cacheKey = ['posts'];
      if (categoryFilter) {
        cacheKey.push(`cat:${categoryFilter}`);
      }
      if (searchFilter) {
        cacheKey.push(`q:${searchFilter}`);
      }
      cacheKey.push(`limit:${limit}`);
      if (cursor) {
        cacheKey.push(`cursor:${cursor}`);
      }

      let cacheHit = true;

      const cachedFn = unstable_cache(
        async () => {
          cacheHit = false;

          const allPosts = await getAllPosts();

          let filteredPosts = allPosts;

          if (categoryFilter) {
            filteredPosts = filteredPosts.filter((post) =>
              post.tags.some(
                (tag) => tag.name.toLowerCase() === categoryFilter,
              ),
            );
          }

          if (searchFilter) {
            filteredPosts = filteredPosts.filter(
              (post) =>
                post.title.toLowerCase().includes(searchFilter) ||
                post.description.toLowerCase().includes(searchFilter),
            );
          }

          let startIndex = 0;
          if (cursor) {
            const cursorIndex = filteredPosts.findIndex(
              (post) => post.id === cursor,
            );
            if (cursorIndex >= 0) startIndex = cursorIndex + 1;
          }

          const posts = filteredPosts.slice(startIndex, startIndex + limit + 1);
          const hasMore = posts.length > limit;
          const slicedPosts = posts.slice(0, limit);
          const nextCursor = hasMore
            ? slicedPosts[slicedPosts.length - 1]?.id
            : undefined;

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
          revalidate: searchFilter ? 60 : cursor ? 60 : 300,
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
      } catch {
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
    .query(async ({ input }) => {
      const { slug } = input;

      let cacheHit = true;

      const cachedFn = unstable_cache(
        async () => {
          cacheHit = false;

          const post = await getPostBySlugFromMdx(slug);

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

  getTags: publicProcedure.query(async () => {
    try {
      const tags = (await getAllTags()).map((tag) => ({
        id: tag,
        name: tag,
      }));
      return {
        tags,
        message: '태그를 불러왔습니다.',
      };
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: '태그를 불러오는 중 오류가 발생했습니다.',
      });
    }
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
    .mutation(async ({ input }) => {
      const { slug, payload } = input;

      try {
        const post = await updatePostMeta({ slug, payload });

        await Promise.all([
          revalidateTag('all-posts', 'max'),
          revalidateTag(`post-${slug}`, 'max'),
        ]);

        return {
          post,
          message: '글을 업데이트하였습니다.',
        };
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '해당 글이 없습니다.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 업데이트하는 중 오류가 발생했습니다.',
        });
      }
    }),
});
