'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { timed } from '@/lib/timer';
import { withActionMetrics } from '@/lib/withActionMetrics';

async function getPostBySlugCached(slugInput: string) {
  return unstable_cache(
    async () => {
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

      return { post, metric: { dbDur, backend } };
    },
    ['post', slugInput],
    { tags: [`post-${slugInput}`] },
  )();
}

export const getPostBySlug = withActionMetrics(async (slugInput: string) => {
  try {
    const { post, metric } = await getPostBySlugCached(slugInput);

    return {
      data: { post },
      message: '글을 불러왔습니다.',
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
}, 'getPostBySlug');
