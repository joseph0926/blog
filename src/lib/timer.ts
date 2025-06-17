import { reqStore } from '@/lib/prisma';

export const timed = async <T>(
  backend: 'psql' | 'kv',
  fn: () => Promise<T>,
): Promise<{ data: T; dbDur: number; backend: typeof backend }> => {
  const t0 = performance.now();
  const data = await fn();
  const dbDur = performance.now() - t0;

  const store = reqStore.getStore();
  if (store) store.dbDur += dbDur;

  return { data, dbDur, backend };
};
