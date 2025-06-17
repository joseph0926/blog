'use server';

import { prisma } from '@/lib/prisma';

export async function fetchPerf(
  route: string,
  hours: number,
): Promise<{ ts: number; p95req: number; p99req: number }[]> {
  return prisma.$queryRaw`
    SELECT
      (EXTRACT(EPOCH FROM "bucket") * 1000)::float8       AS "ts",   
      ("p95Req")::float8                                 AS "p95req",
      ("p99Req")::float8                                 AS "p99req"
    FROM   "ApiMetricHourlyMV"
    WHERE  "route" = ${route}
      AND  "bucket" >= NOW() - ${hours} * interval '1 hour'
    ORDER  BY "ts";
  `;
}
