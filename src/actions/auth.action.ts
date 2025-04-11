'use server';

import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { authSchema, AuthSchemaType } from '@/schemas/auth.schema';
import { ActionResponse } from '@/types/action.type';

export const signup = async (
  payload: AuthSchemaType,
): Promise<ActionResponse<{ user: Omit<User, 'password'> }>> => {
  const { data, success } = authSchema.safeParse(payload);
  if (!success) {
    return {
      data: null,
      message: '유효하지 않은 데이터입니다.',
      success: false,
    };
  }

  try {
    const { email, password } = data;
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: '회원가입에 성공하였습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    };
  } catch (error: unknown) {
    console.error(error);
    return {
      success: false,
      data: null,
      message: '회원가입에 실패하였습니다.',
    };
  }
};
