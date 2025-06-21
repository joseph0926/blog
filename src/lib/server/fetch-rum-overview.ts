'use server';

import { prisma } from '@/lib/prisma';

export type RumOverviewStat = {
  route: string;
  p75Lcp: number | null;
  p75Fcp: number | null;
  p75Ttfb: number | null;
  p75Inp: number | null;
  p90Cls: number | null;
};

export async function fetchRumOverviewStats(hours = 24) {
  return prisma.$queryRaw<RumOverviewStat[]>`
    SELECT
      "route",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY "lcp")  ::float8 AS "p75Lcp",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY "fcp")  ::float8 AS "p75Fcp",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY "ttfb") ::float8 AS "p75Ttfb",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY "inp")  ::float8 AS "p75Inp",
      percentile_cont(0.9)  WITHIN GROUP (ORDER BY "cls")  ::float8 AS "p90Cls"
    FROM "RumMetric"
    WHERE "ts" >= NOW() - ${hours} * INTERVAL '1 hour'
    GROUP BY "route"
    ORDER BY "route"
  `;
}
