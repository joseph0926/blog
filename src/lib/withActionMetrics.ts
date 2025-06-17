import { startOfDay } from 'date-fns';
import { prisma, reqStore } from '@/lib/prisma';
import type { ActionResponse } from '@/types/action.type';

type ServerAction<Args extends any[], R extends ActionResponse<any>> = (
  ...args: Args
) => Promise<R>;

export function withActionMetrics<
  Args extends any[],
  R extends ActionResponse<any>,
>(
  fn: ServerAction<Args, R>,
  name: string,
  backend: string = 'action',
): ServerAction<Args, R> {
  return async (...args: Args): Promise<R> => {
    const t0 = performance.now();

    return await reqStore.run({ dbDur: 0 }, async () => {
      let res!: R;
      try {
        res = await fn(...args);
      } finally {
        ('use server');
        void (async () => {
          try {
            const reqDur = performance.now() - t0;
            const { dbDur } = reqStore.getStore() ?? { dbDur: 0 };

            await prisma.apiMetric.create({
              data: {
                ts: new Date(),
                day: startOfDay(new Date()),
                route: name,
                method: 'ACTION',
                statusCode: res?.status ?? 200,
                backend,
                reqDur,
                dbDur,
                appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'local',
              } satisfies Parameters<typeof prisma.apiMetric.create>[0]['data'],
            });
          } catch (e) {
            console.error('[metrics] action write error', e);
          }
        })();
      }
      return res;
    });
  };
}
