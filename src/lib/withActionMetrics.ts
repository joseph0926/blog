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
  const wrapped = async (...args: Args): Promise<ActionResponse<D>> => {
    const t0 = performance.now();
    let res: ActionResponse<D> | undefined;
    let dbDur = 0;

    res = await reqStore.run({ dbDur: 0 }, async () => {
      const result = await fn(...args);
      dbDur = reqStore.getStore()?.dbDur ?? 0;
      return result;
    });

    const reqDur = performance.now() - t0;

    void (async () => {
      if (ENV === 'dev') return;
      try {
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
            appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev',
            cacheHit: false,
          },
        });
      } catch (e) {
        console.error('[metrics] action write error', e);
      }
    })();

    return res;
  };

  return wrapped;
}
