import { startOfDay } from 'date-fns';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { APP_VERSION } from '@/lib/version';
import { MetricType } from '@/types/action.type';

export async function reportRUMServer(extra: MetricType, route: string) {
  const day = startOfDay(new Date());

  const todayCount = await prisma.serverMetric.count({
    where: {
      day,
      backend: extra.backend,
      appVersion: APP_VERSION,
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

export const getLatestVersions = cache(async () => {
  const rows = await prisma.lighthouseRun.findMany({
    select: { appVersion: true },
    distinct: ['appVersion'],
    orderBy: { ts: 'desc' },
    take: 6,
  });
  return rows.map((r) => r.appVersion);
});
