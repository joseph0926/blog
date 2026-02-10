# joseph0926 블로그 프로젝트 가이드

## 프로젝트 개요

Next.js 기반 개인 블로그 프로젝트입니다. 모노레포 구조(Turbo + pnpm workspace)로 구성되어 있습니다.

### 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Content**: MDX (단일 소스 오브 트루스)
- **API**: tRPC
- **Monorepo**: Turborepo + pnpm workspace

### 디렉토리 구조

```
joseph0926/
├── apps/
│   └── blog/                 # 메인 블로그 앱
│       ├── src/
│       │   ├── app/          # Next.js App Router
│       │   ├── components/   # UI 컴포넌트
│       │   ├── server/trpc/  # tRPC 라우터
│       │   ├── services/     # 비즈니스 로직
│       │   ├── lib/          # 유틸리티
│       │   └── mdx/          # MDX 콘텐츠 (단일 소스)
│       ├── prisma/           # DB 스키마 (Auth 전용)
│       └── vitest.config.ts  # 테스트 설정
└── packages/
    └── ui/                   # 공용 UI 컴포넌트
```

## 아키텍처 원칙

### Post 도메인: MDX 단일 소스 오브 트루스

Post 콘텐츠는 **MDX 파일**을 단일 소스로 사용합니다:

- **목록/검색/메타**: `services/post.service.ts` (MDX frontmatter 기반)
- **본문**: MDX 파일 콘텐츠
- **사이트맵**: MDX 파일 기반 생성 (`app/sitemap.ts`)
- **생성**: `services/post/create-post.service.ts` (MDX 파일 생성)

```typescript
// 포스트 생성 시 slug 규칙
const finalSlug = `${date}-${baseSlug}`; // 예: 2025-06-25-react-hooks
```

### 인증/권한

- **관리자 인증**: JWT 기반 (쿠키: `kyh-admin-token`)
- **Route Handler 가드**: `lib/auth/require-admin.ts`

```typescript
import { requireAdmin } from '@/lib/auth/require-admin';

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth) return auth; // 401/403 응답
  // ... 비즈니스 로직
}
```

## 개발 지침

### 코드 컨벤션

- **파일명**: 케밥 케이스 (`post-card.tsx`)
- **컴포넌트**: 파스칼 케이스 (`PostCard`)
- **함수/변수**: 카멜 케이스 (`getPostById`)
- **상수**: 대문자 스네이크 케이스 (`MAX_FILE_SIZE`)

### tRPC 사용 패턴

```typescript
// 서버 컴포넌트에서는 serverTrpc 사용 (권장)
import { serverTrpc } from '@/server/trpc/server';
const data = await serverTrpc.auth.verify();

// 클라이언트에서는 trpc 훅 사용
import { trpc } from '@/lib/trpc';
const mutation = trpc.auth.logout.useMutation();
```

### 캐시 태그 규칙

```typescript
// 전체 목록
cacheTag('all-posts');

// 개별 포스트
cacheTag(`post-${slug}`);

// revalidate 호출 시
await revalidateTag('all-posts', 'max');
await revalidateTag(`post-${slug}`, 'max');
```

### 파일 업로드

- **엔드포인트**: `/api/upload`
- **인증**: 관리자 전용 (`requireAdmin`)
- **제한**: 이미지만, 5MB 이하
- **저장소**: Cloudinary (자동 WebP 변환, 1200x630 크롭)

## 테스트

```bash
# 로컬 테스트 (테스트 DB 필요)
docker compose -f apps/blog/docker-compose.test.yml up -d
pnpm --filter @joseph0926/blog db:test:push
pnpm --filter @joseph0926/blog test

# CI용 테스트
pnpm --filter @joseph0926/blog test:ci

# 커버리지
pnpm --filter @joseph0926/blog test:coverage
```

### 테스트 설정

- **설정 파일**: `apps/blog/vitest.config.ts`
- **환경 변수**: `apps/blog/.env.test`
- **Mock**: `apps/blog/src/test/__mocks__/`

## 환경 변수

```bash
# apps/blog/.env.local (개발)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
JWT_SECRET="..."

# apps/blog/.env.test (테스트)
# (현재 DB 불필요 - MDX 기반)
```

## CI/CD

### GitHub Actions (`ci.yml`)

1. **환경**: Node.js (`.nvmrc` 기준), pnpm 10.29.2
2. **검증**: lint, format:check, type-check
3. **테스트**: postgres service + vitest
4. **빌드**: turbo build

### 로컬 훅 (Husky)

- **pre-commit**: lint-staged (eslint --fix, prettier --write)
- **pre-push**: (선택적)

## 개선 로드맵

> 완료된 항목과 진행 중인 항목은 [review/](./review/) 디렉토리 참조

### 완료된 개선 사항

- [x] `/admin` 로그인 경로 수정 (`/login`)
- [x] `/api/upload` 보안 강화 (인증 + 파일 검증)
- [x] `/api/revalidate` 인증 + 캐시 태그 정합성
- [x] sitemap 404 유발 버그 수정 (slug 규칙 통일)
- [x] vitest 설정 정합성 (`apps/blog/vitest.config.ts`)
- [x] CI 검증 파이프라인 정상화 (Node 버전, 테스트 단계)
- [x] ReactQueryDevtools 프로덕션 제외
- [x] Post 도메인 MDX 단일 소스 통일

### 남은 작업 (P2/P3)

상세 내용은 [review/analyze.md](./review/analyze.md) 참조

| 우선순위 | 항목                                            | 상태    |
| -------- | ----------------------------------------------- | ------- |
| P2       | ~~루트 vitest.config.ts 레거시 정리~~           | ✅ 완료 |
| P2       | ~~UI/UX 접근성 개선 (aria-label, 키보드 지원)~~ | ✅ 완료 |
| P2       | ~~이미지 sizes 최적화~~                         | ✅ 완료 |
| P3       | E2E 테스트 (Playwright)                         | 미완료  |
| P3       | Lighthouse CI 도입                              | 미완료  |
