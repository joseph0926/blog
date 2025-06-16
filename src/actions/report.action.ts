'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { timed } from '@/lib/timer';
import { ActionResponse } from '@/types/action.type';

const rangeSchema = z.enum(['24h', '7d', '30d']);
const limitSchema = z.coerce.number().int().min(1).max(100).default(10);
const versionSchema = z.string().min(1).max(40);
const ffSchema = z.enum(['desktop', 'mobile']).optional();

export const getDashboardKpi = async (
  rangeInput: unknown,
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
> => {
  const parsed = rangeSchema.safeParse(rangeInput);
  if (!parsed.success)
    return {
      success: false,
      status: 400,
      message: 'range 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const [from, to] = toDateRange(parsed.data);

  try {
    const ser = await prisma.serverMetric.aggregate({
      _avg: { dbDur: true },
      where: { ts: { gte: from, lte: to } },
    });

    const perf = await prisma.lighthouseRun.aggregate({
      _avg: { perfScore: true, lcp: true, cls: true, inp: true },
      where: { ts: { gte: from, lte: to } },
    });

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
};

export const getTimeSeries = async (
  rangeInput: unknown,
): Promise<
  ActionResponse<{ series: { day: string; avg: number; p95: number }[] }>
> => {
  const parsed = rangeSchema.safeParse(rangeInput);
  if (!parsed.success)
    return {
      success: false,
      status: 400,
      message: 'range 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const [from, to] = toDateRange(parsed.data);

  try {
    const rows = await prisma.$queryRaw<
      { day: Date; avg: number; p95: number }[]
    >`
      SELECT date_trunc('day', "ts")                 AS day,
             AVG("dbDur")                            AS avg,
             PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "dbDur") AS p95
      FROM   "ServerMetric"
      WHERE  "ts" BETWEEN ${from} AND ${to}
      GROUP  BY 1
      ORDER  BY 1;
    `;

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
};

export const getTopSlowRoutes = async (
  rangeInput: unknown,
  limitInput: unknown,
): Promise<
  ActionResponse<{
    routes: { route: string; avg: number }[];
  }>
> => {
  const rangeParsed = rangeSchema.safeParse(rangeInput);
  const limitParsed = limitSchema.safeParse(limitInput);
  if (!rangeParsed.success || !limitParsed.success)
    return {
      success: false,
      status: 400,
      message: 'range 또는 limit 파라미터가 유효하지 않습니다.',
      data: null,
    };

  const [from, to] = toDateRange(rangeParsed.data);
  const limit = limitParsed.data;

  try {
    const {
      data: rows,
      dbDur,
      backend,
    } = await timed('psql', () =>
      prisma.serverMetric.groupBy({
        by: ['route'],
        where: { ts: { gte: from, lte: to } },
        _avg: { dbDur: true },
        orderBy: { _avg: { dbDur: 'desc' } },
        take: limit,
      }),
    );

    return {
      success: true,
      status: 200,
      message: '느린 라우트를 불러왔습니다.',
      data: {
        routes: rows.map((r) => ({
          route: r.route,
          avg: r._avg.dbDur ?? 0,
        })),
      },
      metric: { backend, dbDur },
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
};

export const getVersionDelta = async (
  curInput: unknown,
  prevInput: unknown,
  ffInput?: unknown,
): Promise<
  ActionResponse<{
    current: number | null;
    previous: number | null;
    delta: number | null;
  }>
> => {
  const cur = versionSchema.safeParse(curInput);
  const prev = versionSchema.safeParse(prevInput);
  const ff = ffSchema.safeParse(ffInput);
  if (!cur.success || !prev.success)
    return {
      success: false,
      status: 400,
      message: 'version 파라미터가 유효하지 않습니다.',
      data: null,
    };

  try {
    const rows = await prisma.lighthouseRun.groupBy({
      by: ['appVersion'],
      _avg: { perfScore: true },
      where: {
        appVersion: { in: [cur.data, prev.data] },
        ...(ff.success && ff.data ? { formFactor: ff.data } : {}),
      },
    });

    const curRow = rows.find((r) => r.appVersion === cur.data);
    const prevRow = rows.find((r) => r.appVersion === prev.data);

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
};

function toDateRange(range: '24h' | '7d' | '30d'): [Date, Date] {
  const to = new Date();
  const from = new Date();
  if (range === '24h') from.setDate(to.getDate() - 1);
  if (range === '7d') from.setDate(to.getDate() - 7);
  if (range === '30d') from.setDate(to.getDate() - 30);
  return [from, to];
}
