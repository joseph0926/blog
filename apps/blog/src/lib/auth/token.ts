import { errors as JoseErrors, jwtVerify, SignJWT } from 'jose';

let JWT_SECRET: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
  if (!JWT_SECRET) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
  }
  return JWT_SECRET;
}

const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || '1d';

export async function createAdminToken() {
  const jwtSecret = getJwtSecret();

  return await new SignJWT({ isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(ACCESS_EXPIRES)
    .setIssuedAt()
    .sign(jwtSecret);
}

export async function verifyAccessToken(token: string) {
  try {
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      throw new Error('MALFORMED_TOKEN');
    }

    const jwtSecret = getJwtSecret();
    const { payload } = await jwtVerify(token, jwtSecret, {
      algorithms: ['HS256'],
    });

    return { isAdmin: payload.isAdmin };
  } catch (error) {
    if (error instanceof JoseErrors.JWTExpired) {
      throw new Error('TOKEN_EXPIRED');
    }

    if (
      error instanceof JoseErrors.JWSSignatureVerificationFailed ||
      error instanceof JoseErrors.JWTInvalid
    ) {
      throw new Error('INVALID_TOKEN');
    }

    if (
      error instanceof Error &&
      error.message === 'JWT_SECRET is not defined'
    ) {
      throw error;
    }

    console.error('Unexpected token verification error:', error);
    throw new Error('TOKEN_VERIFICATION_FAILED');
  }
}
