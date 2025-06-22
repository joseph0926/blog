import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { PerfSummary } from '@/types/perf.type';

type OneVal = { value: number | null };
const PROD = 'prod' as const;

export const getPerfSummary = cache(async (): Promise<PerfSummary> => {
  const [{ value: lcpPast }] = await prisma.$queryRaw<OneVal[]>`
    SELECT AVG(lcp)::float AS value
      FROM "RumMetric"
     WHERE "environment" = ${PROD}
       AND ts BETWEEN (NOW() - INTERVAL '8 days') AND (NOW() - INTERVAL '1 days')
  `;
  const [{ value: lcpRecent }] = await prisma.$queryRaw<OneVal[]>`
    SELECT AVG(lcp)::float AS value
      FROM "RumMetric"
     WHERE "environment" = ${PROD}
       AND ts > (NOW() - INTERVAL '1 day')
  `;

  const [{ value: clsPast }] = await prisma.$queryRaw<OneVal[]>`
    SELECT AVG(cls)::float AS value
      FROM "RumMetric"
     WHERE "environment" = ${PROD}
       AND ts BETWEEN (NOW() - INTERVAL '8 days') AND (NOW() - INTERVAL '1 days')
  `;
  const [{ value: clsRecent }] = await prisma.$queryRaw<OneVal[]>`
    SELECT AVG(cls)::float AS value
      FROM "RumMetric"
     WHERE "environment" = ${PROD}
       AND ts > (NOW() - INTERVAL '1 day')
  `;

  const [{ value: p95Past }] = await prisma.$queryRaw<OneVal[]>`
    SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur")::float AS value
      FROM "ApiMetric"
     WHERE "environment" = ${PROD}
       AND ts BETWEEN (NOW() - INTERVAL '8 days') AND (NOW() - INTERVAL '1 days')
  `;
  const [{ value: p95Recent }] = await prisma.$queryRaw<OneVal[]>`
    SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY "reqDur")::float AS value
      FROM "ApiMetric"
     WHERE "environment" = ${PROD}
       AND ts > (NOW() - INTERVAL '1 day')
  `;

  const firstBuild = await prisma.buildArtifact.findFirst({
    where: { environment: PROD },
    orderBy: { ts: 'asc' },
  });
  const lastBuild = await prisma.buildArtifact.findFirst({
    where: { environment: PROD },
    orderBy: { ts: 'desc' },
  });

  return {
    lcpPast: lcpPast ?? null,
    lcpRecent: lcpRecent ?? null,
    clsPast: clsPast ?? null,
    clsRecent: clsRecent ?? null,
    p95Past: p95Past ?? null,
    p95Recent: p95Recent ?? null,
    bundlePast: firstBuild?.bundleKb ?? null,
    bundleRecent: lastBuild?.bundleKb ?? null,
  };
});
