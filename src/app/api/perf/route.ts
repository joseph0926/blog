import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const route = req.nextUrl.searchParams.get('route') ?? '/';
  const rows = await prisma.$queryRaw<
    { bucket: Date; p95req: number; p99req: number }[]
  >`
    SELECT "bucket","p95Req" as p95req,"p99Req" as p99req
    FROM   "ApiMetricHourlyMV"
    WHERE  "route" = ${route}
      AND  "bucket" >= NOW() - interval '24 hours'
    ORDER BY "bucket";
  `;
  return NextResponse.json(rows);
}
