import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60 * 1000;

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
    algorithm: 'HS256',
    expiresIn: ACCESS_TOKEN_EXPIRES,
  });

export const generateRefreshToken = () => {
  return { expires: REFRESH_TOKEN_EXPIRES, token: crypto.randomUUID() };
};
