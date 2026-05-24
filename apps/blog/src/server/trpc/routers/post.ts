import { TRPCError } from '@trpc/server';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { defaultLocale } from '@/i18n/routing';
import { perfTimer } from '@/lib/perf-log';
import {
  getAllPosts,
  getAllTags,
  getPostBySlug as getPostBySlugFromMdx,
} from '@/services/post.service';
import { publicProcedure, router } from '../trpc';

const localeSchema = z.enum(['ko', 'en']).default(defaultLocale);

export const postRouter = router({
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
            year: z
              .string()
              .regex(/^\d{4}$/)
              .optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      const { locale, limit, cursor, filter } = input;
      const end = perfTimer('trpc:getPosts');
      const categoryFilter = filter?.category?.toLowerCase();
      const searchFilter = filter?.search?.toLowerCase().trim();
      const yearFilter = filter?.year;

      const cacheKey = ['posts', `locale:${locale}`];
      if (categoryFilter) {
        cacheKey.push(`cat:${categoryFilter}`);
      }
      if (searchFilter) {
        cacheKey.push(`q:${searchFilter}`);
      }
      if (yearFilter) {
        cacheKey.push(`year:${yearFilter}`);
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

          const availableYears = Array.from(
            new Set(
              filteredPosts.map((post) =>
                new Date(post.createdAt).getFullYear().toString(),
              ),
            ),
          );

          if (yearFilter) {
            filteredPosts = filteredPosts.filter(
              (post) =>
                new Date(post.createdAt).getFullYear().toString() ===
                yearFilter,
            );
          }

          const totalCount = filteredPosts.length;

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
            totalCount,
            availableYears,
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
          hasYear: Boolean(yearFilter),
          locale,
          resultCount: result.posts.length,
          totalCount: result.totalCount,
          hasNextCursor: Boolean(result.nextCursor),
        });

        return {
          posts: result.posts,
          nextCursor: result.nextCursor,
          totalCount: result.totalCount,
          availableYears: result.availableYears,
          message: result.posts.length
            ? '글을 불러왔습니다.'
            : '조건에 맞는 글이 없습니다.',
          cacheHit,
        };
      } catch {
        end({
          cacheHit,
          limit,
          hasCursor: Boolean(cursor),
          hasCategory: Boolean(categoryFilter),
          hasSearch: Boolean(searchFilter),
          hasYear: Boolean(yearFilter),
          locale,
          error: true,
        });
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '글을 불러오지 못했습니다.',
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
              message: `${slug} 글을 찾을 수 없습니다.`,
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
          message: '글을 불러오지 못했습니다.',
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
        const [tagNames, posts] = await Promise.all([
          getAllTags(locale),
          getAllPosts(locale),
        ]);
        const tagCounts = posts.reduce<Record<string, number>>((acc, post) => {
          post.tags.forEach((tag) => {
            acc[tag.name] = (acc[tag.name] ?? 0) + 1;
          });
          return acc;
        }, {});
        const tags = tagNames.map((tag) => ({
          id: tag,
          name: tag,
          count: tagCounts[tag] ?? 0,
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
          message: '태그를 불러오지 못했습니다.',
        });
      }
    }),
});
