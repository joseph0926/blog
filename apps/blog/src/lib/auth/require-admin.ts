import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth/cookie';
import { verifyAccessToken } from '@/lib/auth/token';

/**
 * Route Handler용 관리자 인증 가드
 * @returns null이면 인증 성공, NextResponse면 에러 응답
 */
export async function requireAdmin(
  req: NextRequest,
): Promise<NextResponse | null> {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const { isAdmin } = await verifyAccessToken(token);

    if (!isAdmin) {
      return NextResponse.json({ message: 'FORBIDDEN' }, { status: 403 });
    }

    return null;
  } catch {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }
}
