import { hash as argonHash, verify as argonVerify } from '@node-rs/argon2';

export const generateHash = async (plain: string) => {
  return await argonHash(plain, { memoryCost: 48 << 10, timeCost: 3 });
};

export const verifyPassword = async (plain: string, hashed: string) => {
  return await argonVerify(hashed, plain);
};
