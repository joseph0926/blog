import { reqStore } from '@/lib/prisma';

export const timed = async <T>(
  backend: 'psql' | 'kv',
  fn: () => Promise<T>,
): Promise<{ data: T; dbDur: number; backend: typeof backend }> => {
  const store = reqStore.getStore();
  const t0 = performance.now();

  try {
    const data = await fn();
    const dbDur = performance.now() - t0;

    if (store) {
      store.dbDur += dbDur;
    }

    return { data, dbDur, backend };
  } catch (error) {
    const dbDur = performance.now() - t0;

    if (store) {
      store.dbDur += dbDur;
    }

    throw error;
  }
};
