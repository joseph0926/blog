'use server';

import { prisma } from '@/lib/prisma';

export async function fetchPerf(
  route: string,
  hours: number,
): Promise<{ ts: number; p95req: number; p99req: number }[]> {
  return prisma.$queryRaw`
    WITH hourly AS (
      SELECT
        date_trunc('hour', "ts")                         AS bucket,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur") AS p95Req,
        percentile_cont(0.99) WITHIN GROUP (ORDER BY "reqDur") AS p99Req
      FROM   "ApiMetric"
      WHERE  "route" = ${route}
        AND  "ts"   >= NOW() - ${hours} * interval '1 hour'
      GROUP  BY 1
    )
    SELECT (EXTRACT(EPOCH FROM bucket) * 1000)::float8 AS "ts",
           p95Req::float8, p99Req::float8
    FROM   hourly
    ORDER  BY 1;
  `;
}
