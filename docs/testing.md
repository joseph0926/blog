# Testing Strategy

## 도구

| 도구       | 용도                 | 버전 |
| ---------- | -------------------- | ---- |
| Vitest     | Unit + Integration   | 4.x  |
| happy-dom  | DOM 환경 (vitest)    | -    |
| Playwright | E2E (Async RSC 포함) | 1.58 |
| v8         | 커버리지 provider    | -    |

## 테스트 계층

| 계층        | 대상                                | 도구         | DB                           | 비고                  |
| ----------- | ----------------------------------- | ------------ | ---------------------------- | --------------------- |
| Unit        | 유틸, 스키마, 동기 컴포넌트         | Vitest + RTL | X                            | `isolate: false` 가능 |
| Integration | tRPC router, 서비스, Prisma         | Vitest       | O (파일 I/O 또는 PostgreSQL) | `isolate: true` 필수  |
| E2E         | Async Server Component, 사용자 흐름 | Playwright   | O                            | 전체 앱 실행 필요     |

### 왜 E2E가 필요한가

> "Async Server Components are new to the React ecosystem.
> Vitest currently does not support them."
> — Next.js 16 공식 테스팅 가이드

현재 레포의 Server Component (`RecentBlogPosts`, `PostContent` 등)는
비동기 RSC이므로 vitest로 직접 테스트할 수 없다.
사용자 흐름(글 작성 → 목록 표시 → 상세 조회)은 Playwright로 검증한다.

## 커버리지 목표

| 메트릭     | 임계값 | 비고           |
| ---------- | ------ | -------------- |
| Lines      | 60%    | CI 게이트 적용 |
| Branches   | 50%    |                |
| Functions  | 50%    |                |
| Statements | 60%    |                |

`perFile: true` — 파일별 임계값 검증.

## 테스트 규칙

### 필수 규칙

1. 새 기능 → 테스트 동반 필수
2. 버그 수정 → 재현 테스트 먼저 작성, 그 다음 수정
3. tRPC router 추가/수정 → router 테스트 필수
4. 서비스 함수 추가 → unit 또는 integration 테스트 필수
5. Async Server Component → Playwright E2E로 테스트 (vitest 불가)
6. E2E에서 로케이터: `getByRole` > `getByLabel` > `getByTestId` > CSS
7. E2E에서 외부 서비스 의존 금지 (API 라우팅으로 모킹)

### 모킹 원칙

- **최소 모킹**: 실제 동작 검증 우선
- **모킹 대상**: `next/cache` (`unstable_cache`, `revalidateTag`), `server-only` 패키지
- **모킹 금지**: 비즈니스 로직, 파일 I/O (실제 MDX 파일로 검증)
- **DB 테스트**: 실제 PostgreSQL 사용 (`.env.test`의 5433 포트)
- **Mock 자동 정리**: config에서 `clearMocks: true`, `restoreMocks: true`

### 격리 원칙

- `fileParallelism: false` (DB/파일 간섭 방지)
- 각 테스트에서 UUID로 고유한 리소스 생성
- `afterEach`에서 생성한 파일/데이터 명시적 삭제
- Unit 테스트: `isolate: false` 가능 (순수 함수 전제)
- Integration 테스트: `isolate: true` 필수

## Vitest 설정 (개선 사항)

현재 `vitest.config.ts`에 추가할 항목:

```typescript
test: {
  clearMocks: true,       // 각 테스트 후 mock 자동 정리
  restoreMocks: true,     // spy 자동 복원
},
coverage: {
  thresholds: {
    perFile: true,        // 파일별 임계값 검증
  }
}
```

### CI Reporter

```typescript
reporters: process.env.CI
  ? ['default', 'github-actions'] // PR에 직접 주석
  : ['default'];
```

`github-actions` reporter는 vitest 빌트인 (추가 패키지 불필요).

## 테스트 파일 위치

### Vitest (Unit + Integration)

```
src/__tests__/         # 소스 구조를 미러링
├── lib/               # 유틸 단위 테스트
├── services/          # 서비스 통합 테스트
└── server/trpc/       # tRPC 라우터 통합 테스트
```

네이밍: `<원본파일명>.test.ts` 또는 `.test.tsx`

### Playwright (E2E)

```
e2e/                   # 프로젝트 루트에 위치
├── playwright.config.ts
├── blog.spec.ts       # 블로그 목록/상세 흐름
└── i18n.spec.ts       # 다국어 전환 흐름
```

## 실행 명령

| 명령                                           | 용도                    |
| ---------------------------------------------- | ----------------------- |
| `pnpm test`                                    | Vitest 감시 모드 (개발) |
| `pnpm --filter @joseph0926/blog test:ci`       | Vitest CI 단일 실행     |
| `pnpm --filter @joseph0926/blog test:coverage` | 커버리지 리포트         |
| `npx playwright test`                          | E2E 전체 실행           |
| `npx playwright test --ui`                     | E2E UI 모드 (디버깅)    |

## E2E 테스트 전략 (Playwright)

### 대상 시나리오

| 시나리오                               | 검증             |
| -------------------------------------- | ---------------- |
| 블로그 목록 → 태그 필터 → 페이지네이션 | 공개 페이지 동작 |
| 글 상세 → MDX 렌더링                   | Async RSC 렌더링 |
| 다국어 전환 (ko ↔ en)                  | 로케일 fallback  |

### CI 설정

- `workers: 1` (안정성)
- `--trace=retain-on-failure` (실패 시 trace 보존)
- GitHub Actions: `playwright-report` 아티팩트 업로드

### 도입 단계

| Phase | 작업                                  |
| ----- | ------------------------------------- |
| 1     | Playwright 설치, 블로그 목록/상세 E2E |
| 2     | 다국어 전환 테스트 추가               |

## tRPC 라우터 테스트 패턴 (Vitest)

```typescript
import { createCallerFactory } from '@/server/trpc/trpc';
import { postRouter } from '@/server/trpc/routers/post';

const createCaller = createCallerFactory(postRouter);
const caller = createCaller({ user: null, req: undefined });

it('should return posts', async () => {
  const result = await caller.getPosts({ locale: 'ko', limit: 10 });
  expect(result.posts).toBeDefined();
});
```

## 서비스 테스트 패턴 (Vitest)

```typescript
import { createPost } from '@/services/post/create-post.service';

const uniqueId = crypto.randomUUID().slice(0, 8);
const cleanup: string[] = [];

afterEach(() => {
  cleanup.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
  cleanup.length = 0;
});

it('should create mdx file', async () => {
  const post = await createPost({ title: `test-${uniqueId}`, ... });
  cleanup.push(filePath);
  expect(fs.existsSync(filePath)).toBe(true);
});
```
