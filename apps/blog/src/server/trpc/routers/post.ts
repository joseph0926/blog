import { TRPCError } from '@trpc/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { z } from 'zod';
import { defaultLocale } from '@/i18n/routing';
import { perfTimer } from '@/lib/perf-log';
import {
  getAllPosts,
  getAllTags,
  getPostBySlug as getPostBySlugFromMdx,
  updatePostMeta,
} from '@/services/post.service';
import { createPost } from '@/services/post/create-post.service';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const localeSchema = z.enum(['ko', 'en']).default(defaultLocale);

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
          revalidateTag('all-posts-ko', 'max'),
          revalidateTag('all-posts-en', 'max'),
          revalidateTag(`post-ko-${post.slug}`, 'max'),
          revalidateTag(`post-en-${post.slug}`, 'max'),
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
        locale: localeSchema,
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
      const { locale, limit, cursor, filter } = input;
      const end = perfTimer('trpc:getPosts');
      const categoryFilter = filter?.category?.toLowerCase();
      const searchFilter = filter?.search?.toLowerCase().trim();

      const cacheKey = ['posts', `locale:${locale}`];
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

          const allPosts = await getAllPosts(locale);

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
            `all-posts-${locale}`,
            ...(categoryFilter
              ? [`posts-category:${locale}:${categoryFilter}`]
              : []),
          ],
          revalidate: searchFilter ? 60 : cursor ? 60 : 300,
        },
      );

      try {
        const result = await cachedFn();

        end({
          cacheHit,
          limit,
          hasCursor: Boolean(cursor),
          hasCategory: Boolean(categoryFilter),
          hasSearch: Boolean(searchFilter),
          locale,
          resultCount: result.posts.length,
          hasNextCursor: Boolean(result.nextCursor),
        });

        return {
          posts: result.posts,
          nextCursor: result.nextCursor,
          message: result.posts.length
            ? '최신 글을 불러왔습니다.'
            : '글이 없습니다.',
          cacheHit,
        };
      } catch {
        end({
          cacheHit,
          limit,
          hasCursor: Boolean(cursor),
          hasCategory: Boolean(categoryFilter),
          hasSearch: Boolean(searchFilter),
          locale,
          error: true,
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

  getPostBySlug: publicProcedure
    .input(
      z.object({
        locale: localeSchema,
        slug: z.preprocess(
          (val) => (typeof val === 'string' ? decodeURIComponent(val) : val),
          z.string().regex(/^[\p{L}\p{N}\-._~]+$/u, {
            message: '잘못된 글 주소입니다.',
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      const { slug, locale } = input;
      const end = perfTimer('trpc:getPostBySlug');

      let cacheHit = true;

      const cachedFn = unstable_cache(
        async () => {
          cacheHit = false;

          const post = await getPostBySlugFromMdx(slug, locale);

          if (!post) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `${slug}에 해당하는 글을 찾을 수 없습니다.`,
            });
          }

          return post;
        },
        ['post', locale, slug],
        {
          tags: [`post-${locale}-${slug}`],
          revalidate: 3600,
        },
      );

      try {
        const post = await cachedFn();

        end({ cacheHit, slug, locale, found: true });

        return {
          post,
          message: '글을 불러왔습니다.',
          cacheHit,
        };
      } catch (e) {
        if (e instanceof TRPCError) {
          end({ cacheHit, slug, locale, error: e.code });
          throw e;
        }

        end({ cacheHit, slug, locale, error: 'INTERNAL_SERVER_ERROR' });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 불러오는 중 오류가 발생했습니다.',
        });
      }
    }),

  getTags: publicProcedure
    .input(
      z
        .object({
          locale: localeSchema.optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const locale = input?.locale ?? defaultLocale;
      const end = perfTimer('trpc:getTags');
      try {
        const tags = (await getAllTags(locale)).map((tag) => ({
          id: tag,
          name: tag,
        }));
        end({ count: tags.length, locale });
        return {
          tags,
          message: '태그를 불러왔습니다.',
        };
      } catch {
        end({ error: true, locale });
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
          revalidateTag('all-posts-ko', 'max'),
          revalidateTag('all-posts-en', 'max'),
          revalidateTag(`post-ko-${slug}`, 'max'),
          revalidateTag(`post-en-${slug}`, 'max'),
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
