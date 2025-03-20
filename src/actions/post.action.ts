'use server';

import { prisma } from '@/lib/prisma';
import { ActionResponse } from '@/types/action.type';
import { Post } from '@prisma/client';

// debug
// const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getRecentPosts = async (
  limit: number,
): Promise<ActionResponse<Post[]>> => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      data: posts,
      message: posts.length
        ? '최신 post를 불러왔습니다.'
        : '존재하는 post가 없습니다.',
      success: true,
    };
  } catch (error) {
    console.error('모든 posts를 불러오는 중에 에러가 발생하였습니다.', error);
    return {
      data: null,
      message: '모든 posts를 불러오는 중에 에러가 발생하였습니다.',
      success: false,
    };
  }
};
