import { NextResponse } from 'next/server';
import { getPerfSummary } from '@/lib/server/fetch-perf-summary';

export const runtime = 'edge';
export const revalidate = 1800;

export async function GET() {
  const data = await getPerfSummary();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 's-maxage=1800' },
  });
}
