import { hash as argonHash } from '@node-rs/argon2';

export const generateHash = async (plain: string) => {
  return await argonHash(plain, { memoryCost: 48 << 10, timeCost: 3 });
};
