'use server';

import { prisma } from '@/lib/prisma';

export type VitalRow = {
  ts: number;
  p75Lcp: number | null;
  p75Fcp: number | null;
  p75Ttfb: number | null;
  p75Inp: number | null;
  p90Cls: number | null;
};

export async function fetchRumSeries(
  route: string,
  hours: number,
  bucketMinutes = 60,
) {
  return prisma.$queryRaw<VitalRow[]>`
    WITH buckets AS (
      SELECT
        date_trunc('minute', "ts") +
        floor(extract(minute FROM "ts") / ${bucketMinutes}) 
          * interval '${bucketMinutes} minute'                             AS bucket,
        "lcp", "fcp", "ttfb", "inp", "cls"
      FROM "RumMetric"
      WHERE "route" = ${route}
        AND "ts"   >= NOW() - ${hours} * INTERVAL '1 hour'
    )
    SELECT
      extract(epoch FROM bucket)::float8 * 1000                            AS "ts",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY lcp)  FILTER (WHERE lcp  IS NOT NULL)::float8 AS "p75Lcp",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY fcp)  FILTER (WHERE fcp  IS NOT NULL)::float8 AS "p75Fcp",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY ttfb) FILTER (WHERE ttfb IS NOT NULL)::float8 AS "p75Ttfb",
      percentile_cont(0.75) WITHIN GROUP (ORDER BY inp)  FILTER (WHERE inp  IS NOT NULL)::float8 AS "p75Inp",
      percentile_cont(0.9)  WITHIN GROUP (ORDER BY cls)  FILTER (WHERE cls  IS NOT NULL)::float8 AS "p90Cls"
    FROM buckets
    GROUP BY bucket
    ORDER BY bucket;
  `;
}
