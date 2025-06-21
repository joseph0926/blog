'use server';

import { prisma } from '@/lib/prisma';

export type ApiOverviewStat = {
  route: string;
  p95Req: number | null;
  errRate: number | null;
};

export async function fetchApiOverviewStats(hours = 24) {
  return prisma.$queryRaw<ApiOverviewStat[]>`
    SELECT
      "route",
      percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur")::float8 AS "p95Req",
      sum(("statusCode" >= 400)::int)::float8 / count(*) * 100       AS "errRate"
    FROM "ApiMetric"
    WHERE "ts" >= NOW() - ${hours} * INTERVAL '1 hour'
    GROUP BY "route"
    ORDER BY "route"
  `;
}
