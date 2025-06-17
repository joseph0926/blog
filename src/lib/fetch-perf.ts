'use server';

import { prisma } from '@/lib/prisma';

export async function fetchPerfLast24h(route: string) {
  return prisma.$queryRaw<{ bucket: Date; p95req: number; p99req: number }[]>`
    SELECT "bucket","p95Req","p99Req"
    FROM   "ApiMetricHourlyMV"
    WHERE  "route" = ${route}
      AND  "bucket" >= NOW() - interval '24 hours'
    ORDER BY "bucket";
  `;
}
