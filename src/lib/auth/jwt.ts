import { jwtVerify, SignJWT } from 'jose';

const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!,
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!,
);
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION!;
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION!;

type TokenPayload = {
  id: string;
  email: string;
  role: 'ADMIN' | 'GUEST';
};

type VerifyResult =
  | {
      type: 'access';
      id: string;
      email: string;
      role: 'ADMIN' | 'GUEST';
      exp: number | undefined;
    }
  | { type: 'refresh'; id: string; exp: number | undefined };
type AccessTokenPayload = {
  type: 'access';
  id: string;
  email: string;
  role: 'ADMIN' | 'GUEST';
};
type RefreshTokenPayload = { type: 'refresh'; id: string };

export async function createAccessToken(user: TokenPayload) {
  return new SignJWT({ type: 'access', ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_ACCESS_EXPIRATION)
    .sign(JWT_ACCESS_SECRET);
}

export async function createRefreshToken(id: string) {
  return new SignJWT({ type: 'refresh', id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_REFRESH_EXPIRATION)
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyToken(
  token: string,
  type: 'access' | 'refresh',
): Promise<VerifyResult> {
  if (type === 'access') {
    const { payload } = await jwtVerify<AccessTokenPayload>(
      token,
      JWT_ACCESS_SECRET,
      {
        algorithms: ['HS256'],
      },
    );

    if (payload.type !== 'access') {
      throw new Error('AccessToken 인증 에러');
    }

    return {
      type: payload.type,
      id: payload.id,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
    };
  } else {
    const { payload } = await jwtVerify<RefreshTokenPayload>(
      token,
      JWT_REFRESH_SECRET,
      {
        algorithms: ['HS256'],
      },
    );

    if (payload.type !== 'refresh') {
      throw new Error('RefreshToken 인증 에러');
    }

    return { id: payload.id, exp: payload.exp, type: payload.type };
  }
}
