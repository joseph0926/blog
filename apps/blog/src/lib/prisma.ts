import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

export const reqStore = new AsyncLocalStorage<{ dbDur: number }>();

const createPrismaClient = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  const client = new PrismaClient({ adapter });

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
