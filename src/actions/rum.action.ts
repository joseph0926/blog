import { startOfDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { APP_VERSION } from '@/lib/version';
import { MetricType } from '@/types/action.type';

export async function reportRUMServer(extra: MetricType, route: string) {
  const day = startOfDay(new Date());

  const todayCount = await prisma.serverMetric.count({
    where: {
      day,
      backend: extra.backend,
    },
  });
  if (todayCount >= 3) return;

  await prisma.serverMetric.create({
    data: {
      ts: new Date(),
      day,
      route,
      backend: extra.backend,
      dbDur: extra.dbDur,
      appVersion: APP_VERSION,
    },
  });
}
