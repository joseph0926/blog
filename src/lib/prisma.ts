import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const reqStore = new AsyncLocalStorage<{ dbDur: number }>();

const createPrismaClient = () => {
  const client = new PrismaClient();

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        const t0 = performance.now();
        const result = await query(args);
        const dur = performance.now() - t0;

        const store = reqStore.getStore();
        if (store) store.dbDur += dur;

        return result;
      },
    },
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
