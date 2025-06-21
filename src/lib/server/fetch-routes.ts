'use server';

import { prisma } from '@/lib/prisma';

export async function fetchRoutes(): Promise<string[]> {
  const rows = await prisma.apiMetric.groupBy({
    by: ['route'],
    where: { ts: { gte: new Date(Date.now() - 30 * 86_400_000) } },
  });
  return rows.map((r) => r.route).sort();
}
