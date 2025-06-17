import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const reqStore = new AsyncLocalStorage<{ dbDur: number }>();

prisma.$use(async (params, next) => {
  const t0 = performance.now();
  const result = await next(params);
  const dur = performance.now() - t0;

  const store = reqStore.getStore();
  if (store) store.dbDur += dur;

  return result;
});
