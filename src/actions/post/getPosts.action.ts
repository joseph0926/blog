'use server';

import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { timed } from '@/lib/timer';
import { withActionMetrics } from '@/lib/withActionMetrics';

const RecentPostParamsSchema = z.object({
  limit: z.number().min(1).max(100),
  cursor: z.string().cuid().optional(),
  filter: z
    .object({
      category: z.string().optional(),
    })
    .optional(),
});
type RecentPostParamsSchemaType = z.infer<typeof RecentPostParamsSchema>;

function generateCacheKey(params: {
  categoryFilter?: string;
  limit: number;
  cursor?: string;
}) {
  const parts = ['posts'];

  if (params.categoryFilter) {
    parts.push(`cat:${params.categoryFilter}`);
  }

  parts.push(`limit:${params.limit}`);

  if (params.cursor) {
    parts.push(`cursor:${params.cursor}`);
  }

  return parts;
}

const getPostsCached = async ({
  categoryFilter,
  limit,
  cursor,
}: {
  categoryFilter: string | undefined;
  limit: number;
  cursor: string | undefined;
}) => {
  let cacheHit = true;
  const cacheKey = generateCacheKey({ categoryFilter, limit, cursor });

  const cachedFn = unstable_cache(
    async () => {
      cacheHit = false;

      const {
        data: posts,
        dbDur,
        backend,
      } = await timed('psql', () =>
        prisma.post.findMany({
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
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
        }),
      );

      const sliced = posts.slice(0, limit);
      const nextCursor = posts.length > limit ? posts[limit]?.id : undefined;

      return {
        posts: sliced,
        cursorRes: nextCursor,
        metric: { dbDur, backend },
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

  const result = await cachedFn();

  return {
    ...result,
    metric: {
      ...result.metric,
      cacheHit,
    },
  };
};

export const getPosts = withActionMetrics(
  async (params: RecentPostParamsSchemaType) => {
    const parse = RecentPostParamsSchema.safeParse(params);
    if (!parse.success)
      return {
        data: null,
        message:
          parse.error.errors[0]?.message ?? '파라미터가 유효하지 않습니다.',
        status: 400,
        success: false,
      };

    try {
      const { limit, cursor, filter } = parse.data;

      const categoryFilter = filter?.category?.toLowerCase();

      const { posts, cursorRes, metric } = await getPostsCached({
        categoryFilter,
        limit,
        cursor,
      });

      return {
        data: { posts, cursor: cursorRes },
        message: posts.length ? '최신 글을 불러왔습니다.' : '글이 없습니다.',
        success: true,
        status: 200,
        metric,
      };
    } catch (e) {
      console.error(e);
      return {
        message: '글을 불러오는 중 오류가 발생했습니다.',
        data: null,
        success: false,
        status: 500,
      };
    }
  },
  'getPosts',
);
