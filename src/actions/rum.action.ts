import { prisma } from '@/lib/prisma';
import { MetricType } from '@/types/action.type';

export async function reportRUMServer(extra: MetricType, route: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await prisma.webVital.count({
    where: {
      name: 'DBDur',
      backend: extra.backend,
      ts: { gte: startOfDay },
    },
  });

  if (todayCount >= 3) return;

  await prisma.webVital.create({
    data: {
      ts: new Date(),
      url: '_server_',
      name: 'DBDur',
      value: extra.dbDur,
      backend: extra.backend,
      route,
    },
  });
}
