import { startOfDay } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ENV } from '@/lib/env';
import { prisma } from '@/lib/prisma';

const MetricName = z.enum(['LCP', 'CLS', 'INP', 'FID', 'FCP', 'TTFB']);
const FormFactor = z.enum(['desktop', 'mobile']);

const RumSchema = z.object({
  name: MetricName,
  value: z.number().nonnegative().finite(),
  id: z.string().min(1).max(64),
  navType: z.string().optional(),

  appVersion: z.string().min(1).max(40),
  route: z.string().min(1).max(200),
  formFactor: FormFactor,

  deviceMemory: z.number().positive().optional(),
  connType: z.string().max(20).optional(),
});
type RumPayload = z.infer<typeof RumSchema>;

export async function POST(req: NextRequest) {
  let data: RumPayload;

  try {
    const body = await req.json();
    data = RumSchema.parse(body);
  } catch (err) {
    console.warn('[RUM] 잘못된 페이로드', err);
    return NextResponse.json(
      { ok: false, error: 'invalid_payload' },
      { status: 422 },
    );
  }

  try {
    const ts = new Date();
    const day = startOfDay(ts);

    await prisma.rumMetric.create({
      data: {
        ts,
        environment: ENV,
        day,
        route: data.route,
        formFactor: data.formFactor,
        appVersion: data.appVersion,
        lcp: data.name === 'LCP' ? data.value : undefined,
        cls: data.name === 'CLS' ? data.value : undefined,
        inp: data.name === 'INP' ? data.value : undefined,
        fid: data.name === 'FID' ? data.value : undefined,
        fcp: data.name === 'FCP' ? data.value : undefined,
        ttfb: data.name === 'TTFB' ? data.value : undefined,
        deviceMem: data.deviceMemory,
        connType: data.connType,
      },
    });
  } catch (err) {
    console.error('[RUM] DB 저장 실패', err);
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 202 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
