'use server';

import { Prisma } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { timed } from '@/lib/timer';
import { withActionMetrics } from '@/lib/withActionMetrics';
import { updatePostSchema } from '@/schemas/post.schema';
import type { ActionResponse } from '@/types/action.type';
import type {
  TagResponse,
  UpdatePostPayload,
  UpdatePostResponse,
} from '@/types/post.type';

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

    await Promise.all([revalidateTag('posts'), revalidateTag(`post-${slug}`)]);

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

const _getTags = cache(
  async (): Promise<ActionResponse<{ tags: TagResponse[] }>> => {
    try {
      const {
        data: tags,
        dbDur,
        backend,
      } = await timed('psql', () =>
        prisma.tag.findMany({
          where: {},
        }),
      );

      if (!tags)
        return {
          status: 404,
          success: false,
          data: null,
          message: 'Tag를 찾을 수 없습니다.',
        };

      return {
        data: { tags },
        message: '태그를 불러왔습니다.',
        success: true,
        status: 200,
        metric: { backend, dbDur },
      };
    } catch (e) {
      console.error(e);
      return {
        message: '태그를 불러오는 중 오류가 발생했습니다.',
        data: null,
        success: false,
        status: 500,
      };
    }
  },
);
export const getTags = withActionMetrics(_getTags, 'getTags');
