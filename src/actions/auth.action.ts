'use server';

import { generateHash } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';
import { authSchema, type AuthSchemaType } from '@/schemas/auth.schema';
import { ActionResponse } from '@/types/action.type';
import { Prisma } from '@prisma/client';

export const signup = async (
  payload: AuthSchemaType,
): Promise<ActionResponse<{ userId: string }>> => {
  const parsed = authSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.errors[0]?.message ?? '유효하지 않은 입력입니다.',
      data: null,
      status: 400,
    };
  }

  const { email, password } = parsed.data;

  try {
    const hashed = await generateHash(password);

    const user = await prisma.user.create({
      data: { email, password: hashed },
      select: { id: true },
    });

    return {
      success: true,
      message: '회원가입에 성공했습니다.',
      data: { userId: user.id },
      status: 201,
    };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return {
        success: false,
        message: '이미 사용 중인 이메일입니다.',
        data: null,
        status: 409,
      };
    }

    // logger.error(err);
    return {
      success: false,
      message: '서버 오류로 회원가입에 실패했습니다.',
      data: null,
      status: 500,
    };
  }
};
