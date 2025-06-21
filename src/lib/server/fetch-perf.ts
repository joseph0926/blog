'use server';

import { prisma } from '@/lib/prisma';

export type PerfRow = {
  ts: number;
  count: number;
  err: number;
  p95Req: number;
  p99Req: number;
  p95Db: number;
  p99Db: number;
};

export async function fetchPerf(
  route: string,
  hours: number,
  bucketMinutes = 5,
) {
  return prisma.$queryRaw<PerfRow[]>`
    WITH bucketed AS (
      SELECT
        floor(extract(epoch FROM "ts") / (${bucketMinutes} * 60))
          * ${bucketMinutes} * 60 * 1000  AS "ts",
        "statusCode",
        "reqDur",
        "dbDur"
      FROM "ApiMetric"
      WHERE "route" = ${route}
        AND "ts" >= NOW() - ${hours} * interval '1 hour'
    )
    SELECT
      "ts"::float8                          AS "ts",
      count(*)::int                         AS "count",
      sum( ( "statusCode" >= 400 )::int )::int      AS "err",
      percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur")::float8 AS "p95Req",
      percentile_cont(0.99) WITHIN GROUP (ORDER BY "reqDur")::float8 AS "p99Req",
      percentile_cont(0.95) WITHIN GROUP (ORDER BY "dbDur") ::float8 AS "p95Db",
      percentile_cont(0.99) WITHIN GROUP (ORDER BY "dbDur") ::float8 AS "p99Db"
    FROM bucketed
    GROUP BY "ts"
    ORDER BY "ts";
  `;
}
