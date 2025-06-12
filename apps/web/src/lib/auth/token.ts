import { jwtVerify,SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = 60 * 60 * 24 * 7;

export async function signAccessToken(userId: string) {
  return new SignJWT({ typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime(ACCESS_EXPIRES)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(userId: string) {
  const token = await new SignJWT({ typ: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setExpirationTime(REFRESH_EXPIRES)
    .setIssuedAt()
    .sign(JWT_SECRET);

  return { token, expires: REFRESH_EXPIRES };
}

type TokenResult = { userId: string; exp: number };

export async function verifyAccessToken(token: string): Promise<TokenResult> {
  if (typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('MALFORMED_TOKEN');
  }

  const { payload } = await jwtVerify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  });
  if (payload.typ !== 'access') throw new Error('INVALID_TOKEN_TYPE');
  return { userId: payload.sub as string, exp: payload.exp! };
}

export async function verifyRefreshToken(token: string): Promise<TokenResult> {
  const { payload } = await jwtVerify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  });
  if (payload.typ !== 'refresh') throw new Error('INVALID_TOKEN_TYPE');
  return { userId: payload.sub as string, exp: payload.exp! };
}
