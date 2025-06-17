import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(
      'REFRESH MATERIALIZED VIEW CONCURRENTLY "ApiMetricHourlyMV";',
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[MV refresh] error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
