import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';

const bodySchema = z.object({
  slug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 인증 검사
  const authError = await requireAdmin(req);
  if (authError) return authError;

  // 입력 검증
  const body = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    return NextResponse.json({ message: 'BAD_REQUEST' }, { status: 400 });
  }

  // 태그 목록 생성
  const tags = ['all-posts'];
  if (body.data.slug) {
    tags.push(`post-${body.data.slug}`);
  }

  // 캐시 무효화
  await Promise.all(tags.map((tag) => revalidateTag(tag, 'max')));

  return NextResponse.json({ revalidated: true, tags });
}
