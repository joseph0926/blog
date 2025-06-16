'use server';

import { FormFactor,Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { ActionResponse } from '@/types/action.type';
import { getLatestVersions } from './rum.action';

const RANGE = z.enum(['24h', '7d', '30d']);
const VERSION_LITERAL = z.union([
  z.literal('latest'),
  z.literal('previous'),
  z.string().min(1).max(40),
]);

const optionSchema = z.object({
  range: RANGE,
  version: VERSION_LITERAL.optional(),
  backend: z.string().min(1).max(40).optional(),
  route: z.string().max(200).optional(),
  ff: z.enum(['desktop', 'mobile']).optional(),
});
type Option = z.infer<typeof optionSchema>;

const limitSchema = z.coerce.number().int().min(1).max(100).default(10);

function toUtcRange(range: Option['range']): [Date, Date] {
  const to = new Date();
  const from = new Date();
  if (range === '24h') from.setUTCDate(to.getUTCDate() - 1);
  if (range === '7d') from.setUTCDate(to.getUTCDate() - 7);
  if (range === '30d') from.setUTCDate(to.getUTCDate() - 30);
  from.setUTCHours(0, 0, 0, 0);
  to.setUTCHours(23, 59, 59, 999);
  return [from, to];
}

async function resolveVersion(ver?: string): Promise<string | undefined> {
  if (!ver) return undefined;
  const versions = await getLatestVersions();
  if (ver === 'latest') return versions[0];
  if (ver === 'previous') return versions.find((v) => v !== versions[0]);
  return ver;
}

function buildWhere(o: Option & { version?: string | undefined }) {
  const [from, to] = toUtcRange(o.range);
  return {
    ts: { gte: from, lte: to },
    ...(o.version ? { appVersion: o.version } : {}),
    ...(o.backend ? { backend: o.backend } : {}),
    ...(o.route ? { route: o.route } : {}),
  };
}

export async function getDashboardKpi(
  raw: unknown,
): Promise<
  ActionResponse<{
    dbDurAvg: number | null;
    perfAvg: {
      score: number | null;
      lcp: number | null;
      cls: number | null;
      inp: number | null;
    };
  }>
> {
  const parsed = optionSchema.safeParse(raw);
  if (!parsed.success)
    return {
      success: false,
      status: 400,
      message: '요청 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const ver = await resolveVersion(parsed.data.version);
  const where = buildWhere({ ...parsed.data, version: ver });

  try {
    const [ser, perf] = await prisma.$transaction([
      prisma.serverMetric.aggregate({ _avg: { dbDur: true }, where }),
      prisma.lighthouseRun.aggregate({
        _avg: { perfScore: true, lcp: true, cls: true, inp: true },
        where: {
          ...where,
          ...(parsed.data.ff
            ? { formFactor: parsed.data.ff as FormFactor }
            : {}),
        },
      }),
    ]);

    return {
      success: true,
      status: 200,
      message: 'KPI 데이터를 불러왔습니다.',
      data: {
        dbDurAvg: ser._avg.dbDur,
        perfAvg: {
          score: perf._avg.perfScore,
          lcp: perf._avg.lcp,
          cls: perf._avg.cls,
          inp: perf._avg.inp,
        },
      },
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      status: 500,
      message: 'KPI 조회 중 오류가 발생했습니다.',
      data: null,
    };
  }
}

export async function getTimeSeries(
  raw: unknown,
): Promise<
  ActionResponse<{ series: { day: string; avg: number; p95: number }[] }>
> {
  const parsed = optionSchema.safeParse(raw);
  if (!parsed.success)
    return {
      success: false,
      status: 400,
      message: '요청 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const ver = await resolveVersion(parsed.data.version);
  const where = buildWhere({ ...parsed.data, version: ver });

  try {
    const rows = await prisma.$queryRaw<
      { day: Date; avg: number; p95: number }[]
    >(Prisma.sql`
      SELECT "day",
             AVG("dbDur") AS avg,
             PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "dbDur") AS p95
      FROM   "ServerMetric"
      WHERE  "day" BETWEEN ${where.ts.gte} AND ${where.ts.lte}
      ${parsed.data.backend ? Prisma.sql`AND "backend"    = ${parsed.data.backend}` : Prisma.empty}
      ${ver ? Prisma.sql`AND "appVersion" = ${ver}` : Prisma.empty}
      ${parsed.data.route ? Prisma.sql`AND "route"      = ${parsed.data.route}` : Prisma.empty}
      GROUP  BY 1
      ORDER  BY 1;
    `);

    return {
      success: true,
      status: 200,
      message: '시계열 데이터를 불러왔습니다.',
      data: {
        series: rows.map((r) => ({
          day: r.day.toISOString().slice(0, 10),
          avg: Number(r.avg) ?? 0,
          p95: Number(r.p95) ?? 0,
        })),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      status: 500,
      message: '시계열 조회 중 오류가 발생했습니다.',
      data: null,
    };
  }
}

export async function getTopSlowRoutes(
  rawOpt: unknown,
  rawLimit: unknown,
): Promise<ActionResponse<{ routes: { route: string; avg: number }[] }>> {
  const optParsed = optionSchema.safeParse(rawOpt);
  const limitParsed = limitSchema.safeParse(rawLimit);
  if (!optParsed.success || !limitParsed.success)
    return {
      success: false,
      status: 400,
      message: '요청 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const ver = await resolveVersion(optParsed.data.version);
  const where = buildWhere({ ...optParsed.data, version: ver });

  try {
    const rows = await prisma.serverMetric.groupBy({
      by: ['route'],
      where,
      _avg: { dbDur: true },
      orderBy: { _avg: { dbDur: 'desc' } },
      take: limitParsed.data,
    });

    return {
      success: true,
      status: 200,
      message: '느린 라우트를 불러왔습니다.',
      data: {
        routes: rows.map((r) => ({ route: r.route, avg: r._avg.dbDur ?? 0 })),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      status: 500,
      message: '라우트 조회 중 오류가 발생했습니다.',
      data: null,
    };
  }
}

export async function getVersionDelta(
  curVer: unknown,
  prevVer: unknown,
  ffInput?: unknown,
): Promise<
  ActionResponse<{
    current: number | null;
    previous: number | null;
    delta: number | null;
  }>
> {
  const verSchema = VERSION_LITERAL;
  const curRaw = verSchema.safeParse(curVer);
  const prevRaw = verSchema.safeParse(prevVer);
  const ff = z.enum(['desktop', 'mobile']).optional().safeParse(ffInput);

  if (!curRaw.success || !prevRaw.success)
    return {
      success: false,
      status: 400,
      message: 'version 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const cur = await resolveVersion(curRaw.data);
  const prev = await resolveVersion(prevRaw.data);
  if (!cur || !prev)
    return {
      success: false,
      status: 404,
      message: '버전 정보를 찾을 수 없습니다.',
      data: null,
    };

  try {
    const rows = await prisma.lighthouseRun.groupBy({
      by: ['appVersion'],
      _avg: { perfScore: true },
      where: {
        appVersion: { in: [cur, prev] },
        ...(ff.success && ff.data ? { formFactor: ff.data as FormFactor } : {}),
      },
    });

    const curRow = rows.find((r) => r.appVersion === cur);
    const prevRow = rows.find((r) => r.appVersion === prev);

    const current = curRow?._avg.perfScore ?? null;
    const previous = prevRow?._avg.perfScore ?? null;

    return {
      success: true,
      status: 200,
      message: '버전 비교 데이터를 불러왔습니다.',
      data: {
        current,
        previous,
        delta:
          current !== null && previous !== null ? current - previous : null,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      status: 500,
      message: '버전 비교 중 오류가 발생했습니다.',
      data: null,
    };
  }
}
