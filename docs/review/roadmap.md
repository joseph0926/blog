# 개선 로드맵

> 최종 업데이트: 2026-01-30
> 상태: PR-01 ~ PR-06 완료, PR-07 일부 완료

---

## 완료된 PR

### ✅ PR-01: `/admin` 인증 실패 시 로그인 경로 버그 수정

**변경 파일**:

- `apps/blog/src/app/admin/layout.tsx`: `/login`으로 리다이렉트
- `apps/blog/src/components/admin/logout-button.tsx`: `router.replace('/login')`

**검증**: `/admin` 접속 시 인증 실패하면 `/login`으로 이동

---

### ✅ PR-02: `/api/upload` 보안 강화

**변경 파일**:

- `apps/blog/src/app/api/upload/route.ts`: 인증 + 파일 검증
- `apps/blog/src/lib/auth/require-admin.ts`: Route Handler 인증 가드 (신규)
- `apps/blog/src/lib/auth/cookie.ts`: `ADMIN_COOKIE_NAME` export

**구현 내용**:

```typescript
// 인증 검사
const authError = await requireAdmin(req);
if (authError) return authError;

// 파일 타입/크기 검증
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

---

### ✅ PR-03: `/api/revalidate` 인증 + 캐시 태그 정합성

**변경 파일**:

- `apps/blog/src/app/api/revalidate/route.ts`

**구현 내용**:

```typescript
import { requireAdmin } from '@/lib/auth/require-admin';

const bodySchema = z.object({
  slug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const tags = ['all-posts'];
  if (body.data.slug) tags.push(`post-${body.data.slug}`);

  await Promise.all(tags.map((tag) => revalidateTag(tag, 'max')));
}
```

---

### ✅ PR-04: `sitemap.ts` 404 유발 버그 수정

**변경 파일**:

- `apps/blog/src/app/sitemap.ts`

**변경 내용**:

- slug에서 날짜 제거 로직 제거 → 파일명 전체 사용
- 존재하지 않는 라우트(`/report`, `/report/history`) 제거
- `/admin` 라우트 제거

```typescript
// Before: 날짜 제거
slug = dateMatch[2]; // ❌

// After: 파일명 전체 사용
const slug = fileNameWithoutExt; // ✅
```

---

### ✅ PR-05: vitest 설정 정합성 + 테스트 수정

**변경 파일**:

- `apps/blog/vitest.config.ts` (신규)
- `apps/blog/package.json`: `--config ./vitest.config.ts`
- `apps/blog/src/__tests__/services/post/create-post.service.test.ts`

**vitest.config.ts**:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(
        __dirname,
        './src/test/__mocks__/server-only.ts',
      ),
    },
  },
});
```

**테스트 수정**:

```typescript
// Before: 중복 slug면 throw 기대
await expect(post).rejects.toThrow('이미 존재하는 slug입니다');

// After: suffix(-2) 생성 기대
expect(post2.slug).toContain('-2');
```

---

### ✅ PR-06: CI 검증 파이프라인 정상화

**변경 파일**:

- `.github/workflows/ci.yml`

**변경 내용**:

1. Node 버전: `node-version-file: '.nvmrc'`
2. postgres service 추가
3. 검증 단계: `lint`, `format:check`, `type-check`
4. 테스트 단계: `db:test:push` → `test:ci`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: testuser
      POSTGRES_PASSWORD: testpass
      POSTGRES_DB: testdb
    ports:
      - 5433:5432

steps:
  - run: pnpm --filter @joseph0926/blog lint
  - run: pnpm --filter @joseph0926/blog format:check
  - run: pnpm --filter @joseph0926/blog type-check
  - run: pnpm --filter @joseph0926/blog db:test:push
  - run: pnpm --filter @joseph0926/blog test:ci
```

---

### ✅ PR-07: UI/UX & a11y 개선 (부분 완료)

**완료 항목**:

- ReactQueryDevtools 프로덕션 제외

```typescript
{process.env.NODE_ENV !== 'production' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

---

### ✅ PR-08: 루트 vitest.config.ts 정리

**우선순위**: P2
**난이도**: 낮음
**상태**: 완료 (2026-01-31)

**변경 내용**:

- `vitest.config.ts` (루트) 삭제
- `turbo.json`에 `test`, `test:ci`, `lint` task 추가
- `apps/blog/vitest.config.ts`에 coverage threshold 추가 (lines: 60, branches: 50, functions: 50, statements: 60)

---

### ✅ PR-09: UI/UX 접근성 개선

**우선순위**: P2
**난이도**: 중간
**상태**: 완료 (2026-01-31)

**변경 내용**:

- `file-upload.tsx`: `role="button"`, `tabIndex`, `onKeyDown` (이미 적용됨)
- `floating.tsx`: `aria-label`, `aria-expanded` (이미 적용됨)
- `post-dialog.tsx`: 썸네일 제거 버튼 `aria-label` (이미 적용됨)
- `posts-table.tsx`: 더보기 버튼 `aria-label="게시글 작업 메뉴 열기"` 추가

---

### ✅ PR-10: 이미지 sizes 최적화

**우선순위**: P2
**난이도**: 낮음
**상태**: 완료 (2026-01-31)

**변경 내용**:

- `blog-post-card.tsx`: `sizes` 속성 (이미 적용됨)
- `blog-post.tsx`: `sizes` 속성 추가 (type에 따라 동적 적용)

---

## 남은 PR (P2/P3)

### 🔄 PR-11: E2E 테스트 도입

**우선순위**: P2
**난이도**: 중간~높음

**신규 파일**:

- `apps/blog/playwright.config.ts`
- `apps/blog/tests/e2e/auth.spec.ts`
- `apps/blog/tests/e2e/admin.spec.ts`

**테스트 시나리오**:

1. 로그인 → 관리자 페이지 진입
2. 포스트 생성
3. 포스트 수정/삭제
4. 로그아웃

---

### 🔄 PR-12: 커버리지 품질 게이트

**우선순위**: P2
**난이도**: 중간

**변경 파일**:

- `apps/blog/vitest.config.ts`
- `.github/workflows/ci.yml`

**개선 내용**:

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  thresholds: {
    lines: 60,
    branches: 50,
    functions: 50,
    statements: 60,
  },
}
```

---

### 🔄 PR-13: Lighthouse CI 도입

**우선순위**: P3
**난이도**: 중간

**신규 파일**:

- `.github/workflows/lighthouse.yml`
- `lighthouserc.json`

**측정 항목**:

- Performance: LCP, INP, CLS
- Accessibility
- Best Practices
- SEO

---

## 중기 Epic (3개월)

### EPIC-01: 도메인 슬라이스 구조 전환

**목표**: `features/post/{components,services,types}` 구조로 점진 전환

**단계**:

1. `features/` 디렉토리 생성
2. 새 기능 추가 시 도메인 슬라이스 구조 적용
3. 기존 코드 점진 이동

**리스크**: 대규모 리팩토링, 테스트 필수

---

## 실행 우선순위 (권장)

1. **PR-08**: 루트 vitest.config 정리 (빠른 정리)
2. **PR-09**: UI/UX 접근성 개선 (사용자 경험)
3. **PR-10**: 이미지 sizes 최적화 (성능)
4. **PR-12**: 커버리지 품질 게이트 (품질 보장)
5. **PR-11**: E2E 테스트 (회귀 방지)
6. **PR-13**: Lighthouse CI (성능 모니터링)
