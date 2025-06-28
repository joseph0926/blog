'use server';

import { z } from 'zod';
import { cached } from '@/lib/cache';
import { prisma } from '@/lib/prisma';
import { timed } from '@/lib/timer';
import { withActionMetrics } from '@/lib/withActionMetrics';
import type { MetricType } from '@/types/action.type';
import type { PostResponse } from '@/types/post.type';

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

const getPostsDB = async ({
  categoryFilter,
  limit,
  cursor,
}: {
  categoryFilter: string | undefined;
  limit: number;
  cursor: string | undefined;
}): Promise<{
  posts: PostResponse[];
  cursorRes: string | undefined;
  metric: MetricType;
}> => {
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
  const cursorRes = posts.length > limit ? posts[limit]?.id : undefined;

  return { posts: sliced, cursorRes, metric: { dbDur, backend } };
};

const getPostsCached = cached(getPostsDB, ['posts'], ['posts']);

export const getPosts = withActionMetrics(
  async (params: RecentPostParamsSchemaType) => {
    try {
      const parse = RecentPostParamsSchema.safeParse(params);
      if (!parse.success)
        return {
          data: null,
          message:
            parse.error.errors[0]?.message ?? '파라미터가 유효하지 않습니다.',
          status: 400,
          success: false,
        };

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
