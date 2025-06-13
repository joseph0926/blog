'use server';

import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { generateHash, verifyPassword } from '@/lib/auth/password';
import { generateRefreshToken, signAccessToken } from '@/lib/auth/token';
import { prisma } from '@/lib/prisma';
import { delay } from '@blog/ui/lib/utils';
import { authSchema, type AuthSchemaType } from '@/schemas/auth.schema';
import { ActionResponse } from '@/types/action.type';
import { UserResponse } from '@/types/user.type';

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

export const signin = async (
  payload: AuthSchemaType,
): Promise<ActionResponse<{ user: UserResponse }>> => {
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

  let user: { id: string; email: string; password: string } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, password: true },
    });
  } catch (err) {
    console.error(err);
    // logger.error({ err, scope: 'signin#findUnique' });
    return {
      success: false,
      message: '서버 오류로 로그인에 실패했습니다.',
      data: null,
      status: 500,
    };
  }

  if (!user) {
    await delay(1200);
    return {
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      data: null,
      status: 401,
    };
  }

  const isMatch = await verifyPassword(password, user.password);
  user.password = '';

  if (!isMatch) {
    await delay(1200);
    return {
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      data: null,
      status: 401,
    };
  }

  const accessToken = await signAccessToken(user.id);
  const { token, expires } = await generateRefreshToken(user.id);

  const ck = await cookies();
  ck.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  ck.set({
    name: 'refreshToken',
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: expires,
    path: '/auth',
  });

  return {
    data: {
      user: {
        id: user.id,
        email: user.email,
      },
    },
    success: true,
    status: 200,
    message: '로그인에 성공하였습니다.',
  };
};
