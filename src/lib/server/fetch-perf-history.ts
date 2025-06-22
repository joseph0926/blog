import { cache } from 'react';
import { prisma } from '@/lib/prisma';

type HistoryRow = {
  date: string;
  lcp: number | null;
  p95: number | null;
  bundle: number | null;
};

const PROD = 'prod' as const;

export const getPerfHistory = cache(
  async (days = 30): Promise<HistoryRow[]> => {
    const rows = await prisma.$queryRaw<HistoryRow[]>`
      WITH dates AS (
        SELECT generate_series(
                 (CURRENT_DATE - INTERVAL '${days - 1} days'),
                 CURRENT_DATE,
                 INTERVAL '1 day'
               )::date AS d
      ),
      lcp_daily AS (
        SELECT day::date AS d, AVG(lcp)::float AS lcp
          FROM "RumMetric"
         WHERE "environment" = ${PROD}
           AND ts >= CURRENT_DATE - INTERVAL '${days} days'
         GROUP BY day
      ),
      p95_daily AS (
        SELECT day::date AS d,
               percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur")::float AS p95
          FROM "ApiMetric"
         WHERE "environment" = ${PROD}
           AND ts >= CURRENT_DATE - INTERVAL '${days} days'
         GROUP BY day
      ),
      bundle_daily AS (
        SELECT date_trunc('day', ts)::date AS d,
               AVG("bundleKb")::float       AS bundle
          FROM "BuildArtifact"
         WHERE "environment" = ${PROD}
           AND ts >= CURRENT_DATE - INTERVAL '${days} days'
         GROUP BY date_trunc('day', ts)
      )
      SELECT  to_char(d.d, 'YYYY-MM-DD') AS date,
              lcp_daily.lcp,
              p95_daily.p95,
              bundle_daily.bundle
        FROM dates d
        LEFT JOIN lcp_daily    USING (d)
        LEFT JOIN p95_daily    USING (d)
        LEFT JOIN bundle_daily USING (d)
       ORDER BY date;
    `;
    return rows;
  },
);
