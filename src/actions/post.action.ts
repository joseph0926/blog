'use server';

import { Post, Prisma } from '@prisma/client';
import { cache } from 'react';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { timed } from '@/lib/timer';
import { withActionMetrics } from '@/lib/withActionMetrics';
import { updatePostSchema } from '@/schemas/post.schema';
import type { ActionResponse } from '@/types/action.type';
import type {
  PostResponse,
  UpdatePostPayload,
  UpdatePostResponse,
} from '@/types/post.type';

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

const _getRecentPosts = async (
  params: RecentPostParamsSchemaType,
): Promise<
  ActionResponse<{ posts: PostResponse[]; cursor: string | undefined }>
> => {
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

  try {
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

    return {
      data: { posts: sliced, cursor: cursorRes },
      message: posts.length ? '최신 글을 불러왔습니다.' : '글이 없습니다.',
      success: true,
      status: 200,
      metric: { backend, dbDur },
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
};
export const getRecentPosts = withActionMetrics(
  _getRecentPosts,
  'getRecentPosts',
);

const _getPostBySlug = cache(
  async (slugInput: string): Promise<ActionResponse<{ post: Post }>> => {
    try {
      const {
        data: post,
        dbDur,
        backend,
      } = await timed('psql', () =>
        prisma.post.findUnique({ where: { slug: slugInput } }),
      );

      if (!post)
        return {
          status: 404,
          success: false,
          data: null,
          message: '해당 글을 찾을 수 없습니다.',
        };

      return {
        data: { post },
        message: '글을 불러왔습니다.',
        success: true,
        status: 200,
        metric: { backend, dbDur },
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
);
export const getPostBySlug = withActionMetrics(_getPostBySlug, 'getPostBySlug');

const _updatePost = async (
  slug: string,
  payload: UpdatePostPayload,
): Promise<ActionResponse<{ post: UpdatePostResponse }>> => {
  const parse = updatePostSchema.safeParse(payload);
  if (!parse.success)
    return {
      data: null,
      message:
        parse.error.errors[0]?.message ?? 'thumbnail이 유효하지 않습니다.',
      status: 400,
      success: false,
    };

  const { thumbnail } = parse.data;

  try {
    const post = await prisma.post.update({
      where: { slug },
      data: { thumbnail },
      select: { slug: true, thumbnail: true, updatedAt: true },
    });

    return {
      data: { post },
      success: true,
      status: 200,
      message: '글을 업데이트하였습니다.',
    };
  } catch (e) {
    console.error(e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025')
        return {
          status: 404,
          success: false,
          message: '해당 글이 없습니다.',
          data: null,
        };
      if (e.code === 'P2002')
        return {
          status: 409,
          success: false,
          message: 'slug 중복입니다.',
          data: null,
        };
    }
    return {
      message: '글을 업데이트하는 중 오류가 발생했습니다.',
      data: null,
      success: false,
      status: 500,
    };
  }
};
export const updatePost = withActionMetrics(_updatePost, 'updatePost');
