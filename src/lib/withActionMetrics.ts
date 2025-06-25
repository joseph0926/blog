import { startOfDay } from 'date-fns';
import { prisma, reqStore } from '@/lib/prisma';
import type { ActionResponse } from '@/types/action.type';
import { ENV } from './env';

export type ServerAction<Args extends unknown[], D> = (
  ...args: Args
) => Promise<ActionResponse<D>>;

export function withActionMetrics<Args extends unknown[], D = unknown>(
  fn: ServerAction<Args, D>,
  name: string,
  backend: string = 'action',
): ServerAction<Args, D> {
  let res: ActionResponse<D> | undefined;

  const wrapped = async (...args: Args): Promise<ActionResponse<D>> => {
    const t0 = performance.now();

    return await reqStore.run({ dbDur: 0 }, async () => {
      try {
        res = await fn(...args);
      } finally {
        void (async () => {
          try {
            const reqDur = performance.now() - t0;
            const { dbDur } = reqStore.getStore() ?? { dbDur: 0 };

            await prisma.apiMetric.create({
              data: {
                ts: new Date(),
                environment: ENV,
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
            /* eslint-disable-next-line no-console */
            console.error('[metrics] action write error', e);
          }
        })();
      }

      return res;
    });
  };

  return wrapped;
}
