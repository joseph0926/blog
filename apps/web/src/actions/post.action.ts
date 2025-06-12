'use server';

import { Post, Prisma } from '@prisma/client';
import { cache } from 'react';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { updatePostSchema } from '@/schemas/post.schema';
import { ActionResponse } from '@/types/action.type';
import {
  PostResponse,
  UpdatePostPayload,
  UpdatePostResponse,
} from '@/types/post.type';

const limitSchema = z.coerce.number().int().min(1).max(100);

export const getRecentPosts = async (
  limitInput: number,
): Promise<ActionResponse<{ posts: PostResponse[] }>> => {
  const parse = limitSchema.safeParse(limitInput);
  if (!parse.success)
    return {
      data: null,
      message:
        parse.error.errors[0]?.message ?? 'limit 파라미터가 유효하지 않습니다.',
      status: 400,
      success: false,
    };

  const limit = parse.data;

  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        createdAt: true,
        description: true,
        tags: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      data: { posts },
      message: posts.length ? '최신 글을 불러왔습니다.' : '글이 없습니다.',
      success: true,
      status: 200,
    };
  } catch (e) {
    console.error(e);
    // logger.error(e, { scope: 'getRecentPosts' });
    return {
      message: '글을 불러오는 중 오류가 발생했습니다.',
      data: null,
      success: false,
      status: 500,
    };
  }
};

export const getPostBySlug = cache(
  async (slugInput: string): Promise<ActionResponse<{ post: Post }>> => {
    try {
      const post = await prisma.post.findUnique({
        where: { slug: slugInput },
      });
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
      };
    } catch (e) {
      console.error(e);
      // logger.error(e, { scope: 'getPostBySlug' });
      return {
        message: '글을 불러오는 중 오류가 발생했습니다.',
        data: null,
        success: false,
        status: 500,
      };
    }
  },
);

export const updatePost = async (
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
      where: {
        slug,
      },
      data: {
        thumbnail,
      },
      select: { slug: true, thumbnail: true, updatedAt: true },
    });

    return {
      data: {
        post,
      },
      success: true,
      status: 200,
      message: '글을 업데이트하였습니다.',
    };
  } catch (e) {
    console.error(e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      switch (e.code) {
        case 'P2025':
          return {
            status: 404,
            success: false,
            message: '해당 글이 없습니다.',
            data: null,
          };
        case 'P2002':
          return {
            status: 409,
            success: false,
            message: 'slug 중복입니다.',
            data: null,
          };
      }
    }
    // logger.error(e, { scope: 'getRecentPosts' });
    return {
      message: '글을 업데이하는 중 오류가 발생했습니다.',
      data: null,
      success: false,
      status: 500,
    };
  }
};
