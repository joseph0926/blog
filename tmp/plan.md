# 하네스 도입 계획서

> 작성일: 2026-03-21
> 상태: 확정 대기 → 사용자 확인 후 구현 시작
> 완료 후 이 tmp/ 폴더는 삭제 예정

---

## 목차

1. [배경 및 목적](#1-배경-및-목적)
2. [현재 레포 상태](#2-현재-레포-상태)
3. [레퍼런스 분석 요약](#3-레퍼런스-분석-요약)
4. [최종 파일 트리](#4-최종-파일-트리)
5. [구현 상세 — docs/architecture.md](#5-docsarchitecturemd)
6. [구현 상세 — docs/testing.md](#6-docstestingmd)
7. [구현 상세 — docs/conventions.md](#7-docsconventionsmd)
8. [구현 상세 — CLAUDE.md](#8-claudemd)
9. [구현 상세 — scripts/verify.sh](#9-scriptsverifysh)
10. [구현 상세 — .husky/pre-push 교체](#10-huskypre-push-교체)
11. [구현 상세 — .claude/settings.json (hooks)](#11-claudesettingsjson-hooks)
12. [구현 상세 — .harness/ 세션 상태](#12-harness-세션-상태)
13. [구현 상세 — Playwright E2E](#13-playwright-e2e)
14. [구현 상세 — CI 강화](#14-ci-강화)
15. [도입 순서 및 체크리스트](#15-도입-순서-및-체크리스트)
16. [출처](#16-출처)

---

## 1. 배경 및 목적

### 문제

| 문제                  | 증상                                                               |
| --------------------- | ------------------------------------------------------------------ |
| 라우팅 대상 문서 없음 | CLAUDE.md가 "여기 보세요"라고 할 상세 문서가 존재하지 않음         |
| 테스트 전략 없음      | 무엇을 어떻게 테스트할지 가이드 부재. Async RSC 테스트 방법 미정의 |
| 강제성 없음           | 검증 스크립트를 실행 안 해도 그만. 에이전트가 lint 없이 넘어감     |
| 세션 상태 없음        | compact/새 세션 시 복귀 지점과 이전 작업 이력 불명                 |

### 목적

AI 에이전트(Claude Code)가 이 레포에서 작업할 때:

1. 프로젝트 구조와 컨벤션을 빠르게 파악할 수 있고 (진입 문서 + 라우팅)
2. 코드 품질을 자동으로 강제당하며 (hooks + CI)
3. 어떤 테스트를 어떻게 작성해야 하는지 알고 (테스트 전략)
4. 세션이 끊겨도 이전 작업을 이어갈 수 있게 (세션 상태 관리)

만드는 것이 목표이다.

### 핵심 원칙 (레퍼런스에서 도출)

- **환경 우선, 프롬프트 후순위**: 프롬프트를 늘리기 전에 도구, 관측성, 격리 확보
- **목차 패턴**: CLAUDE.md는 100줄 이내의 진입점, 상세는 docs/로 라우팅
- **린터를 LLM에게 맡기지 않기**: hooks로 자동화
- **"이 줄을 제거하면 Claude가 실수할까?"**: 아니면 삭제

---

## 2. 현재 레포 상태

### 기술 스택

| 계층       | 기술                           | 버전  |
| ---------- | ------------------------------ | ----- |
| 런타임     | Node.js                        | >= 24 |
| 프레임워크 | Next.js (App Router)           | 16.x  |
| 언어       | TypeScript (strict)            | 5.9   |
| API        | tRPC + superjson               | 11.x  |
| ORM        | Prisma + @prisma/adapter-pg    | 7.x   |
| DB         | PostgreSQL                     | 16    |
| 상태관리   | TanStack React Query + Zustand | 5.x   |
| UI         | Radix UI + Tailwind CSS v4     | -     |
| 콘텐츠     | MDX (파일시스템 기반)          | -     |
| 다국어     | next-intl (ko, en)             | 4.x   |
| 인증       | JWT (jose) + httpOnly 쿠키     | -     |
| 이미지     | Cloudinary                     | -     |
| 빌드       | Turbo + pnpm                   | -     |
| 테스트     | Vitest 4.x + happy-dom         | -     |

### 모노레포 구조

```
joseph0926/
├── apps/blog/          # 메인 블로그 앱 (Next.js)
└── packages/ui/        # 공유 UI 컴포넌트 (Radix + Tailwind)
```

의존 방향: `apps/blog → packages/ui` (단방향). 역참조 금지.

### 기존 강제 장치

| 장치        | 위치                     | 내용                                          |
| ----------- | ------------------------ | --------------------------------------------- |
| pre-commit  | .husky/pre-commit        | `pnpm type-check && pnpm lint-staged`         |
| pre-push    | .husky/pre-push          | `pnpm db:gen && pnpm build`                   |
| CI          | .github/workflows/ci.yml | lint → format → typecheck → test → build      |
| lint-staged | package.json             | `.{ts,tsx}` → eslint --fix + prettier --write |

### 기존 테스트 현황

- 테스트 파일: 3개, 테스트 케이스: 9개
- 계층: Unit(4개 — cn, delay), Integration(5개 — tRPC router, createPost 서비스)
- 미커버: 컴포넌트, 인증, Prisma 연동, 에러 시나리오, Async Server Components
- 커버리지 임계값: lines 60%, branches 50%, functions 50%, statements 60%
- CI에서 `--coverage` 미사용 (임계값 강제 안 됨)

### apps/blog/src 디렉토리 책임

| 디렉토리       | 책임                                                            |
| -------------- | --------------------------------------------------------------- |
| `app/`         | 라우팅, 레이아웃, 메타데이터. (auth), [locale], admin, api/ 등  |
| `components/`  | React 컴포넌트 — feature별 분리 (about/, blog/, admin/, post/)  |
| `server/trpc/` | tRPC 라우터, 컨텍스트, 미들웨어 (root.ts, context.ts, routers/) |
| `services/`    | 비즈니스 로직 — MDX 파일 I/O (post.service.ts)                  |
| `lib/`         | 유틸리티, 인증, Prisma 클라이언트 (auth/, prisma.ts, trpc.ts)   |
| `types/`       | 타입 정의 (post.type.ts, action.type.ts)                        |
| `hooks/`       | 클라이언트 훅 (use-mobile.ts)                                   |
| `schemas/`     | Zod 검증 스키마                                                 |
| `mdx/`         | MDX 컴포넌트 레지스트리                                         |
| `i18n/`        | 다국어 설정 (routing.ts)                                        |
| `messages/`    | 번역 파일 (ko.json, en.json)                                    |
| `__tests__/`   | 테스트 (소스 구조 미러링)                                       |

### 데이터 흐름

```
[클라이언트]
  ↓ tRPC (httpBatchLink + superjson)
[서버: tRPC Router]
  ├─ publicProcedure → Zod 입력 검증 → 서비스 호출
  └─ protectedProcedure → isAuth 미들웨어 → Zod → 서비스 호출
[서비스]
  ├─ MDX 파일 읽기/쓰기 (src/mdx/*.mdx)
  └─ Prisma → PostgreSQL (User, Post, Tag, RefreshToken)
[캐싱]
  └─ unstable_cache + revalidateTag (ISR, 60~300초)
```

### 인증 흐름

```
POST /api/trpc/auth.login
  → 비밀번호 검증 (argon2)
  → JWT 발급 (jose, HS256)
  → httpOnly 쿠키 설정
  → 이후 요청: 쿠키 → verifyAccessToken → ctx.user
```

### DB 스키마

```
User (id, email, password, createdAt, updatedAt)
  └→ RefreshToken (id, token, expiresAt, revoked, userId)

Post (id, slug, title, description, thumbnail, tags[], createdAt)
  └↔ Tag (id, name, posts[])  // M:N 관계
```

인덱스: Post(createdAt, id), RefreshToken(token)

---

## 3. 레퍼런스 분석 요약

### 3.1 ref/ai/ — 하네스 엔지니어링 (8개 문서)

| 문서                                                       | 핵심 교훈                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| harness-engineering.md (OpenAI)                            | 하네스 = 환경 설계. AGENTS.md는 짧은 진입점. 반복 규칙 → lint/test로 승격        |
| unrolling-the-codex-agent-loop.md (OpenAI)                 | 에이전트 루프 = 추론→실행→피드백. 컨텍스트 윈도우 관리 필수                      |
| unlocking-the-codex-harness.md (OpenAI)                    | 하네스를 여러 표면에서 재사용. MCP vs App Server 선택 기준                       |
| equip-responses-api-computer-environment.md (OpenAI)       | Shell tool + 격리 환경 + compaction + Skills = 완전한 에이전트 환경              |
| demystifying-evals-for-ai-agents.md (Anthropic)            | Swiss Cheese Model (결정적 + LLM + 인간 검사). transcript 읽기                   |
| building-c-compiler.md (Anthropic)                         | 병렬 에이전트: lock 파일, progress 문서, 테스트 품질이 병렬화 한계 결정          |
| effective-harnesses-for-long-running-agents.md (Anthropic) | 세션 브릿지: feature list, progress notes, init script. 세션 종료 시 깨끗한 상태 |

### 3.2 ref/vitest-v4/ — 테스트 베스트 프랙티스

- **커버리지**: `perFile: true`로 파일별 검증. 핵심 경로 90%, 나머지 60%
- **Mock 자동 정리**: config에서 `clearMocks: true`, `restoreMocks: true`
- **격리**: unit은 `isolate: false` 가능 (순수 함수), integration은 `isolate: true` 필수
- **CI Reporter**: `github-actions` reporter → PR에 직접 주석
- **Global Setup**: DB 마이그레이션 1회, setup file에서 테스트별 정리
- **Monorepo**: `defineProject`로 프로젝트별 설정 분리

### 3.3 ref/nextjs-v16/ — 아키텍처/테스트

- **Async Server Components는 vitest로 테스트 불가** → E2E(Playwright) 필수
- **`'use cache'` directive**: `unstable_cache` 대체 가능 (next.config.ts `cacheComponents: true`)
- **`cacheLife`/`cacheTag`/`updateTag`**: 새로운 캐싱 API
- **`_folderName`**: private 폴더 (라우팅 제외)
- **조직 전략**: app/ 밖에 코드, route group으로 레이아웃 분리

### 3.4 ref/playwright-v1.58/ — E2E 전략

- **로케이터**: `getByRole()` > `getByLabel()` > `getByTestId()` > CSS
- **격리**: 각 테스트 독립 실행, 외부 의존성 회피
- **CI**: workers: 1, `--trace=retain-on-failure`, report artifact 업로드
- **블로그 프로젝트 가치**: 어드민 CRUD + 사용자 흐름 검증 ROI 높음

### 3.5 웹검색 — 2026 최신 패턴

| 주제      | 핵심                                                                                      |
| --------- | ----------------------------------------------------------------------------------------- |
| CLAUDE.md | 100줄 이내 목차 패턴. "이 줄 제거 시 실수?" 필터. 린터를 LLM에게 맡기지 말 것             |
| Hooks     | PostToolUse(Write\|Edit) → auto lint+format. PreCompact → state 백업. exit 0=성공, 2=차단 |
| 하네스    | Martin Fowler: 실행 루프+도구 체인+검증+컨텍스트 전체 시스템. "on the loop" 패러다임      |
| 테스트    | Async RSC → Playwright. Vitest happy-dom 2-3배 빠름. AAA 패턴                             |
| 세션 상태 | PreCompact 훅으로 자동 백업. STATE 파일 패턴. 자동 컴팩션 ~167K 토큰에서 발동             |

---

## 4. 최종 파일 트리

구현 후 추가/변경되는 파일:

```
joseph0926/
├── CLAUDE.md                        # [NEW] 진입점 (~40줄, 목차 패턴)
├── docs/
│   ├── architecture.md              # [NEW] 구조, 스택, 데이터 흐름, 캐싱
│   ├── testing.md                   # [NEW] 3계층 테스트 전략
│   └── conventions.md               # [NEW] 코드 컨벤션
├── .harness/                        # [NEW] 세션 상태 관리
│   └── (토픽별 디렉토리는 첫 사용 시 생성)
├── .claude/
│   ├── settings.json                # [NEW] 프로젝트 hooks (git 커밋)
│   └── settings.local.json          # [기존] 개인 권한 설정 (gitignore)
├── scripts/
│   └── verify.sh                    # [NEW] 전체 검증 스크립트
├── e2e/                             # [NEW] Playwright E2E 테스트
│   ├── playwright.config.ts
│   ├── fixtures/
│   ├── admin.spec.ts
│   └── blog.spec.ts
├── .husky/
│   ├── pre-commit                   # [기존 유지]
│   └── pre-push                     # [수정] verify.sh 호출로 교체
├── .github/workflows/
│   └── ci.yml                       # [수정] coverage + Playwright 추가
├── apps/blog/
│   ├── vitest.config.ts             # [수정] clearMocks, reporters 추가
│   └── ...
└── packages/ui/
```

---

## 5. docs/architecture.md

### 전체 내용

```markdown
# Architecture

## 개요

개인 기술 블로그. Turbo 모노레포 기반, Next.js 풀스택.

## 기술 스택

| 계층       | 기술                           | 버전  |
| ---------- | ------------------------------ | ----- |
| 런타임     | Node.js                        | >= 24 |
| 프레임워크 | Next.js (App Router)           | 16.x  |
| 언어       | TypeScript (strict)            | 5.9   |
| API        | tRPC + superjson               | 11.x  |
| ORM        | Prisma + @prisma/adapter-pg    | 7.x   |
| DB         | PostgreSQL                     | 16    |
| 상태관리   | TanStack React Query + Zustand | 5.x   |
| UI         | Radix UI + Tailwind CSS v4     | -     |
| 콘텐츠     | MDX (파일시스템 기반)          | -     |
| 다국어     | next-intl (ko, en)             | 4.x   |
| 인증       | JWT (jose) + httpOnly 쿠키     | -     |
| 이미지     | Cloudinary                     | -     |
| 빌드       | Turbo + pnpm                   | -     |

## 모노레포 구조

apps/blog/ — 메인 블로그 앱 (Next.js)
packages/ui/ — 공유 UI 컴포넌트 (Radix + Tailwind)

의존 방향: apps/blog → packages/ui (단방향). 역참조 금지.

## apps/blog 디렉토리 책임

| 디렉토리         | 책임                              | 핵심 파일                     |
| ---------------- | --------------------------------- | ----------------------------- |
| src/app/         | 라우팅, 레이아웃, 메타데이터      | page.tsx, layout.tsx          |
| src/components/  | React 컴포넌트 (feature별 분리)   | about/, blog/, admin/, post/  |
| src/server/trpc/ | tRPC 라우터, 컨텍스트, 미들웨어   | root.ts, context.ts, routers/ |
| src/services/    | 비즈니스 로직 (MDX 파일 I/O)      | post.service.ts               |
| src/lib/         | 유틸리티, 인증, Prisma 클라이언트 | auth/, prisma.ts, trpc.ts     |
| src/types/       | 타입 정의                         | post.type.ts, action.type.ts  |
| src/hooks/       | 클라이언트 훅                     | use-mobile.ts                 |
| src/schemas/     | Zod 검증 스키마                   | -                             |
| src/mdx/         | MDX 컴포넌트 레지스트리           | component-registry.ts         |
| src/i18n/        | 다국어 설정                       | routing.ts                    |
| src/messages/    | 번역 파일                         | ko.json, en.json              |
| src/**tests**/   | 테스트 (소스 구조 미러링)         | -                             |

## 데이터 흐름

[클라이언트]
↓ tRPC (httpBatchLink + superjson)
[서버: tRPC Router]
├─ publicProcedure → Zod 입력 검증 → 서비스 호출
└─ protectedProcedure → isAuth 미들웨어 → Zod → 서비스 호출
[서비스]
├─ MDX 파일 읽기/쓰기 (src/mdx/\*.mdx)
└─ Prisma → PostgreSQL (User, Post, Tag, RefreshToken)
[캐싱]
└─ unstable_cache + revalidateTag (ISR, 60~300초)

## 인증 흐름

POST /api/trpc/auth.login
→ 비밀번호 검증 (argon2)
→ JWT 발급 (jose, HS256)
→ httpOnly 쿠키 설정
→ 이후 요청: 쿠키 → verifyAccessToken → ctx.user

## 라우트 구조

| 경로             | 유형    | 설명               |
| ---------------- | ------- | ------------------ |
| /                | SSG     | 홈 (최근 글)       |
| /about           | SSG     | 소개               |
| /blog            | SSG+ISR | 글 목록, 태그 필터 |
| /post/[slug]     | SSG+ISR | 개별 글            |
| /en/...          | SSG     | 영문 버전          |
| /admin           | CSR     | 관리자 대시보드    |
| /login           | CSR     | 로그인             |
| /api/trpc/[trpc] | API     | tRPC 엔드포인트    |
| /api/upload      | API     | 이미지 업로드      |
| /api/revalidate  | API     | ISR 재검증         |

## DB 스키마

User (id, email, password, createdAt, updatedAt)
└→ RefreshToken (id, token, expiresAt, revoked, userId)

Post (id, slug, title, description, thumbnail, tags[], createdAt)
└↔ Tag (id, name, posts[]) // M:N 관계

인덱스: Post(createdAt, id), RefreshToken(token)

## 캐싱 전략

### 현재 패턴 (unstable_cache)

unstable_cache(fn, keys, { tags, revalidate })
→ revalidateTag('all-posts-ko') 로 무효화

### Next.js 16 신규 패턴 (향후 마이그레이션 대상)

| 현재                           | Next.js 16                                              |
| ------------------------------ | ------------------------------------------------------- |
| unstable_cache(fn, keys, opts) | 'use cache' + cacheLife('hours') + cacheTag('posts')    |
| revalidateTag('tag')           | revalidateTag('tag') (SWR) 또는 updateTag('tag') (즉시) |

마이그레이션 시기: next.config.ts에 cacheComponents: true 활성화 후.
```

---

## 6. docs/testing.md

### 전체 내용

````markdown
# Testing Strategy

## 도구

| 도구       | 용도                 | 버전 |
| ---------- | -------------------- | ---- |
| Vitest     | Unit + Integration   | 4.x  |
| happy-dom  | DOM 환경 (vitest)    | -    |
| Playwright | E2E (Async RSC 포함) | 1.58 |
| v8         | 커버리지 provider    | -    |

## 테스트 계층

| 계층        | 대상                                | 도구         | DB                           | 비고                |
| ----------- | ----------------------------------- | ------------ | ---------------------------- | ------------------- |
| Unit        | 유틸, 스키마, 동기 컴포넌트         | Vitest + RTL | X                            | isolate: false 가능 |
| Integration | tRPC router, 서비스, Prisma         | Vitest       | O (파일 I/O 또는 PostgreSQL) | isolate: true 필수  |
| E2E         | Async Server Component, 사용자 흐름 | Playwright   | O                            | 전체 앱 실행 필요   |

### 왜 E2E가 필요한가

> "Async Server Components are new to the React ecosystem.
> Vitest currently does not support them."
> — Next.js 16 공식 테스팅 가이드

현재 레포의 Server Component (RecentBlogPosts, PostContent 등)는
비동기 RSC이므로 vitest로 직접 테스트할 수 없다.
사용자 흐름(글 작성 → 목록 표시 → 상세 조회)은 Playwright로 검증한다.

## 커버리지 목표

| 메트릭     | 임계값 | 비고           |
| ---------- | ------ | -------------- |
| Lines      | 60%    | CI 게이트 적용 |
| Branches   | 50%    |                |
| Functions  | 50%    |                |
| Statements | 60%    |                |

perFile: true — 파일별 임계값 검증.

## 테스트 규칙

### 필수 규칙

1. 새 기능 → 테스트 동반 필수
2. 버그 수정 → 재현 테스트 먼저 작성, 그 다음 수정
3. tRPC router 추가/수정 → router 테스트 필수
4. 서비스 함수 추가 → unit 또는 integration 테스트 필수
5. Async Server Component → Playwright E2E로 테스트 (vitest 불가)
6. E2E에서 로케이터: getByRole > getByLabel > getByTestId > CSS
7. E2E에서 외부 서비스 의존 금지 (API 라우팅으로 모킹)

### 모킹 원칙

- 최소 모킹: 실제 동작 검증 우선
- 모킹 대상: next/cache (unstable_cache, revalidateTag), server-only 패키지
- 모킹 금지: 비즈니스 로직, 파일 I/O (실제 MDX 파일로 검증)
- DB 테스트: 실제 PostgreSQL 사용 (.env.test의 5433 포트)
- Mock 자동 정리: config에서 clearMocks: true, restoreMocks: true

### 격리 원칙

- fileParallelism: false (DB/파일 간섭 방지)
- 각 테스트에서 UUID로 고유한 리소스 생성
- afterEach에서 생성한 파일/데이터 명시적 삭제
- Unit 테스트: isolate: false 가능 (순수 함수 전제)
- Integration 테스트: isolate: true 필수

## Vitest 설정 (개선 사항)

현재 vitest.config.ts에 추가할 항목:

```typescript
test: {
  clearMocks: true,       // 각 테스트 후 mock 자동 정리
  restoreMocks: true,     // spy 자동 복원
},
coverage: {
  perFile: true,          // 파일별 임계값 검증
}
```
````

### CI Reporter 설정

```typescript
reporters: process.env.CI
  ? ['default', 'github-actions'] // PR에 직접 주석
  : ['default'];
```

## 테스트 파일 위치

### Vitest (Unit + Integration)

```
src/__tests__/         # 소스 구조를 미러링
├── lib/               # 유틸 단위 테스트
├── services/          # 서비스 통합 테스트
└── server/trpc/       # tRPC 라우터 통합 테스트
```

네이밍: <원본파일명>.test.ts 또는 .test.tsx

### Playwright (E2E)

```
e2e/                   # 프로젝트 루트에 위치
├── playwright.config.ts
├── fixtures/          # 테스트 데이터, 인증 상태
├── admin.spec.ts      # 어드민 CRUD 흐름
└── blog.spec.ts       # 블로그 목록/상세 흐름
```

## 실행 명령

| 명령                                         | 용도                    |
| -------------------------------------------- | ----------------------- |
| pnpm test                                    | Vitest 감시 모드 (개발) |
| pnpm --filter @joseph0926/blog test:ci       | Vitest CI 단일 실행     |
| pnpm --filter @joseph0926/blog test:coverage | 커버리지 리포트         |
| npx playwright test                          | E2E 전체 실행           |
| npx playwright test --ui                     | E2E UI 모드 (디버깅)    |

## E2E 테스트 전략 (Playwright)

### 대상 시나리오

| 시나리오                               | 검증                  |
| -------------------------------------- | --------------------- |
| 로그인 → 글 작성 → 목록 확인           | 어드민 CRUD 전체 흐름 |
| 블로그 목록 → 태그 필터 → 페이지네이션 | 공개 페이지 동작      |
| 글 상세 → MDX 렌더링                   | Async RSC 렌더링      |
| 다국어 전환 (ko ↔ en)                  | 로케일 fallback       |

### CI 설정

- workers: 1 (안정성)
- --trace=retain-on-failure (실패 시 trace 보존)
- GitHub Actions: playwright-report 아티팩트 업로드

### 도입 단계

| 단계    | 작업                                           |
| ------- | ---------------------------------------------- |
| Phase 1 | Playwright 설치, 어드민 로그인+글 작성 E2E 1개 |
| Phase 2 | 블로그 목록/상세 테스트 추가, CI 자동화        |
| Phase 3 | 비주얼 리그레션 (toHaveScreenshot)             |

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

````

---

## 7. docs/conventions.md

### 전체 내용

```markdown
# Code Conventions

## 파일 네이밍

| 유형 | 패턴 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | BlogPostCard.tsx |
| 서비스 | kebab-case + .service | post.service.ts, create-post.service.ts |
| 타입 | kebab-case + .type | post.type.ts |
| 유틸 | kebab-case | generate-post.ts |
| 훅 | use-kebab-case | use-mobile.ts |
| 스키마 | kebab-case + .schema | - |
| 테스트 | 원본명 + .test | utils.test.ts |

## 컴포넌트 패턴

### Server Component (기본)
```tsx
export const RecentBlogPosts = async ({ locale }: Props) => {
  const data = await fetchData();
  return <div>{...}</div>;
};
````

### Client Component

```tsx
'use client';
export const BlogFilter = ({ tags }: Props) => {
  const [selected, setSelected] = useState(null);
  return <div>{...}</div>;
};
```

### 판단 기준

- hooks, 이벤트 핸들러 필요 → 'use client'
- async 데이터 페칭, 파일/DB 접근 → Server Component
- import 'server-only'로 서버 전용 모듈 명시

## Private 폴더

\_folderName 접두사 → Next.js 라우팅에서 자동 제외.
라우트 그룹 내 공유 컴포넌트 배치에 사용.
예: app/blog/\_components/BlogPostCard.tsx

## Export 패턴

- Named export 사용 (default export 지양)
- 타입: export type TypeName = {...}

## Import 순서 (simple-import-sort 강제)

```tsx
// 1. 외부 패키지
import { Badge } from '@joseph0926/ui/components/badge';
import Image from 'next/image';

// 2. 내부 (@/ alias)
import { PostResponse } from '@/types/post.type';

// 3. 상대 경로 (같은 feature 내에서만)
import { BlogPostCard } from './blog-post-card';
```

## tRPC 패턴

- publicProcedure: 인증 불필요 (읽기)
- protectedProcedure: isAuth 미들웨어 통과 필수 (쓰기)
- 입력: Zod 스키마로 검증
- 에러: TRPCError로 던지기 (code: UNAUTHORIZED, CONFLICT 등)

## 에러 처리

| 위치            | 패턴                                            |
| --------------- | ----------------------------------------------- |
| tRPC router     | throw new TRPCError({ code, message })          |
| Route handler   | NextResponse.json({ message }, { status })      |
| 페이지 컴포넌트 | notFound() 또는 에러 UI                         |
| 인증 가드       | requireAdmin() → null(성공) 또는 Response(실패) |

## 타입 패턴

```tsx
// Response 타입
export type PostResponse = { id: string; slug: string; ... };

// Generic wrapper
export type ActionResponse<T = null> = {
  data: T | null; message: string; success: boolean; status: number;
};

// 추론
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
```

## Prisma 규칙

- ID: cuid()
- 모든 테이블: createdAt + updatedAt
- 스키마 변경 → pnpm db:gen → pnpm db:push
- 마이그레이션: prisma migrate dev (개발), prisma db push (테스트)

## 캐싱

```tsx
const result = unstable_cache(
  async () => {
    /* 로직 */
  },
  ['cache-key', `locale:${locale}`],
  { tags: ['all-posts-ko'], revalidate: 300 },
);
```

무효화: revalidateTag('all-posts-ko') — 쓰기 mutation 후 반드시 호출

## 다국어

- 기본 로케일: ko (URL 접두사 없음)
- 영문: /en/...
- MDX 파일: slug.mdx (한국어), slug.en.mdx (영어)
- 번역: src/messages/{ko,en}.json + useTranslations('key')
- 로케일 fallback: en 요청인데 en 파일 없으면 → ko 반환 + isFallback: true

````

---

## 8. CLAUDE.md

### 전체 내용 (~40줄, 목차 패턴)

```markdown
# CLAUDE.md

개인 기술 블로그. Turbo + pnpm 모노레포.

## 스택

Next.js 16 (App Router) / tRPC 11 / Prisma 7 / PostgreSQL / TypeScript strict
UI: Radix + Tailwind v4 / 콘텐츠: MDX / 다국어: next-intl (ko, en)

## 구조

apps/blog/     — 메인 앱
packages/ui/   — 공유 UI 컴포넌트
의존 방향: apps → packages (단방향, 역참조 금지)

## 검증

모든 작업 완료 전:
  ./scripts/verify.sh

개별 실행:
  pnpm lint                                       # ESLint
  pnpm --filter @joseph0926/blog format:check     # Prettier
  pnpm type-check                                 # tsc --noEmit
  pnpm --filter @joseph0926/blog test:ci          # Vitest
  pnpm build                                      # Next.js 빌드

## 테스트 규칙

- 새 기능 → 테스트 동반 필수
- 버그 수정 → 재현 테스트 먼저
- Async Server Component → Playwright E2E (vitest 불가)
- 동기 컴포넌트/유틸/서비스 → Vitest

## 금지

- server-only 모듈을 클라이언트에서 import
- packages/ui → apps/* 역참조
- 코드 읽기 전 변경 제안

## 세션 상태

새 세션/compact 후 → .harness/<토픽>/state.md 먼저 읽고 이어서 작업.
세션 종료 시 → state.md 갱신 + log.md에 이력 추가.

## 상세 문서

- [docs/architecture.md](docs/architecture.md) — 기술 스택, 디렉토리 책임, 데이터 흐름, 캐싱
- [docs/testing.md](docs/testing.md) — 테스트 전략 (Unit/Integration/E2E), 패턴, 규칙
- [docs/conventions.md](docs/conventions.md) — 코드 컨벤션, 네이밍, import 규칙
````

---

## 9. scripts/verify.sh

### 전체 내용

```bash
#!/bin/bash
set -euo pipefail

echo "=== lint ==="
pnpm lint

echo "=== format ==="
pnpm --filter @joseph0926/blog format:check

echo "=== typecheck ==="
pnpm type-check

echo "=== test ==="
pnpm --filter @joseph0926/blog test:ci

echo "=== build ==="
pnpm build

echo "=== All checks passed ==="
```

실행 권한: `chmod +x scripts/verify.sh`

---

## 10. .husky/pre-push 교체

### 현재

```bash
pnpm db:gen
pnpm build
```

### 변경 후

```bash
pnpm db:gen
./scripts/verify.sh
```

효과: push 시 lint + format + typecheck + test + build 전체 파이프라인 강제.

---

## 11. .claude/settings.json (hooks)

### 전체 내용

프로젝트 레벨 설정 파일. git에 커밋하여 공유.
기존 `.claude/settings.local.json`(개인 권한)과 별도.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(cat | jq -r '.tool_input.file_path // empty') && [ -n \"$FILE\" ] && [[ \"$FILE\" =~ \\.(ts|tsx|js|jsx)$ ]] && npx eslint --fix \"$FILE\" 2>/dev/null && npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[harness] compact 전 .harness/<토픽>/state.md를 갱신하세요'"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[harness] 세션 종료 시 .harness/<토픽>/state.md 갱신 + log.md 이력 추가'"
          }
        ]
      }
    ]
  }
}
```

### Hook 설명

| Hook                      | 트리거                | 효과                                 |
| ------------------------- | --------------------- | ------------------------------------ |
| PostToolUse (Write\|Edit) | .ts/.tsx 파일 수정 후 | 자동 eslint --fix + prettier --write |
| PreCompact                | compact 직전          | state.md 갱신 알림                   |
| Stop                      | Claude 응답 완료 시   | 세션 이력 기록 알림                  |

### 주의

- `.claude/settings.json` (프로젝트, git 커밋) ≠ `.claude/settings.local.json` (개인, gitignore)
- `.gitignore`에 `settings.local.json`이 이미 있는지 확인 필요

---

## 12. .harness/ 세션 상태

### 디렉토리 구조

```
.harness/
├── <토픽>/
│   ├── state.md              # 현재 작업 상태 (매 세션 종료/compact 전 갱신)
│   └── log.md                # 세션 이력 (최대 10개 엔트리)
└── archive/
    └── <토픽>-log-<날짜>.md  # 아카이브된 로그
```

토픽 디렉토리는 작업 시작 시 생성. 예: `.harness/harness-setup/`, `.harness/auth-refactor/`

### state.md 형식

```markdown
## STATE (updated: 2026-03-21 14:30)

Goal: [현재 목표]
Constraints: [제약사항]
Progress: [완료된 것]
Next: [다음 할 것]
Blocked: [막힌 것]
Files: [수정한 파일 목록]
```

### log.md 형식

최신이 위에 오는 역순 정렬.

```markdown
## 2026-03-21 세션 2

- 목표: scripts/verify.sh 생성
- 작업: verify.sh 생성, pre-push hook 교체
- 결과: 완료

---

## 2026-03-21 세션 1

- 목표: 하네스 도입 계획
- 작업: CLAUDE.md, docs/\* 작성
- 결과: 완료
```

### 아카이브 규칙

log.md 엔트리가 10개 초과 시:

1. 가장 오래된 엔트리들을 `archive/<토픽>-log-<날짜>.md`로 이동
2. log.md에는 최근 10개만 유지
3. 아카이브 파일 상단에 토픽명과 기간 기록

### 운영 규칙

- 새 세션/compact 후: `.harness/<관련토픽>/state.md` 먼저 읽기
- 세션 종료 시: state.md 갱신 + log.md에 이력 추가
- 토픽 완료 시: state.md에 "Goal: 완료" 기록, 이후 더 이상 갱신하지 않음
- `.harness/`는 `.gitignore`에 추가 (로컬 전용)

---

## 13. Playwright E2E

### 설치

```bash
pnpm add -Dw @playwright/test
npx playwright install chromium --with-deps
```

### e2e/playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'html' : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm --filter @joseph0926/blog dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 대상 시나리오

| 파일          | 시나리오                                                      |
| ------------- | ------------------------------------------------------------- |
| admin.spec.ts | 로그인 → 글 작성 → 목록 확인 → 수정 → 삭제                    |
| blog.spec.ts  | 블로그 목록 → 태그 필터 → 페이지네이션 → 글 상세 → MDX 렌더링 |

### Phase별 도입

| Phase | 작업                                                 | 시기              |
| ----- | ---------------------------------------------------- | ----------------- |
| 1     | Playwright 설치 + admin.spec.ts (로그인+글 작성 1개) | 하네스 구현 직후  |
| 2     | blog.spec.ts + CI 자동화                             | Phase 1 안정화 후 |
| 3     | 비주얼 리그레션 (toHaveScreenshot) + 다국어          | 추후              |

---

## 14. CI 강화

### .github/workflows/ci.yml 변경사항

기존 CI에 3가지 추가:

#### 1. 테스트에 --coverage 추가

```yaml
- name: Run tests
  run: pnpm --filter @joseph0926/blog test:ci --coverage
  env:
    DATABASE_URL: postgresql://testuser:testpass@localhost:5433/testdb
```

#### 2. Playwright E2E 단계 추가 (Phase 2부터)

```yaml
- name: Install Playwright
  run: npx playwright install chromium --with-deps

- name: Run E2E tests
  run: npx playwright test --config e2e/playwright.config.ts
  env:
    DATABASE_URL: postgresql://testuser:testpass@localhost:5433/testdb
    JWT_SECRET: ${{ secrets.JWT_SECRET }}

- name: Upload Playwright report
  if: failure()
  uses: actions/upload-artifact@v5
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

#### 3. Vitest reporter 변경 (선택)

apps/blog/vitest.config.ts에서 CI 환경 감지:

```typescript
reporters: process.env.CI ? ['default', 'github-actions'] : ['default'];
```

---

## 15. 도입 순서 및 체크리스트

### 구현 순서

| #   | 작업                             | 파일                       | 선행 조건                     |
| --- | -------------------------------- | -------------------------- | ----------------------------- |
| 1   | docs/architecture.md 작성        | docs/architecture.md       | 없음                          |
| 2   | docs/testing.md 작성             | docs/testing.md            | 없음                          |
| 3   | docs/conventions.md 작성         | docs/conventions.md        | 없음                          |
| 4   | CLAUDE.md 작성                   | CLAUDE.md                  | #1, #2, #3 (라우팅 대상 존재) |
| 5   | scripts/verify.sh 생성           | scripts/verify.sh          | 없음                          |
| 6   | .husky/pre-push 교체             | .husky/pre-push            | #5                            |
| 7   | .claude/settings.json hooks 생성 | .claude/settings.json      | 없음                          |
| 8   | vitest.config.ts 개선            | apps/blog/vitest.config.ts | 없음                          |
| 9   | .harness/ 초기화                 | .harness/, .gitignore      | 없음                          |
| 10  | Playwright 설치 + config         | e2e/, package.json         | 없음                          |
| 11  | 첫 E2E 테스트 작성               | e2e/admin.spec.ts          | #10                           |
| 12  | CI 강화 (coverage)               | .github/workflows/ci.yml   | #8                            |
| 13  | CI 강화 (Playwright)             | .github/workflows/ci.yml   | #11                           |

### 체크리스트

```
Phase 1: 문서 + 강제 장치
- [x] #1  docs/architecture.md 작성 (2026-03-21 완료)
- [x] #2  docs/testing.md 작성 (2026-03-21 완료)
- [x] #3  docs/conventions.md 작성 (2026-03-21 완료)
- [x] #4  CLAUDE.md 작성 (목차 패턴, 50줄) (2026-03-21 완료)
- [x] #5  scripts/verify.sh 생성 + chmod +x (2026-03-21 완료)
- [x] #6  .husky/pre-push → verify.sh 호출로 교체 (2026-03-21 완료)
- [x] #7  .claude/settings.json hooks 생성 (2026-03-21 완료)
- [x] #8  vitest.config.ts 개선 (clearMocks, perFile, reporters) (2026-03-21 완료)
- [x] #9  .harness/ 초기화 + .gitignore 추가 (2026-03-21 완료)
- [x] #9a .harness/README.md 운영 규칙 + 템플릿 (2026-03-21 완료)
- [x] #9b .harness/harness-setup/ state.md + log.md 생성 (2026-03-21 완료)

Phase 2: E2E + CI
- [ ] #10 Playwright 설치 + e2e/playwright.config.ts
- [ ] #11 e2e/admin.spec.ts 작성 (로그인+글 작성)
- [ ] #12 ci.yml: test:ci --coverage 추가
- [ ] #13 ci.yml: Playwright 단계 추가

Phase 3: 확장 (추후)
- [ ] e2e/blog.spec.ts 작성
- [ ] 비주얼 리그레션 테스트
- [ ] 다국어 E2E 테스트
- [ ] 커버리지 임계값 상향 검토
```

### 검증 방법

각 단계 완료 후:

- Phase 1 검증: `./scripts/verify.sh` 성공
- Phase 2 검증: `npx playwright test` 성공 + CI 파이프라인 통과
- 전체 검증: 새 세션에서 CLAUDE.md 읽기 → docs/ 참조 → 작업 시작 → verify.sh 통과

---

## 16. 출처

### 로컬 레퍼런스 (~/Downloads/@work/study-all/ref/)

| 파일                                                         | 저자/출처                                   |
| ------------------------------------------------------------ | ------------------------------------------- |
| ref/ai/harness-engineering.md                                | Ryan Lopopolo, OpenAI, 2026-02-11           |
| ref/ai/unrolling-the-codex-agent-loop.md                     | Michael Bolin, OpenAI, 2026-01-23           |
| ref/ai/unlocking-the-codex-harness.md                        | Celia Chen, OpenAI, 2026-02-04              |
| ref/ai/equip-responses-api-computer-environment.md           | Bo Xu et al., OpenAI, 2026-03-11            |
| ref/ai/demystifying-evals-for-ai-agents.md                   | Mikaela Grace et al., Anthropic, 2026-01-09 |
| ref/ai/building-c-compiler.md                                | Nicholas Carlini, Anthropic, 2026-02-05     |
| ref/ai/effective-harnesses-for-long-running-agents.md        | Justin Young, Anthropic, 2025-11-26         |
| ref/vitest-v4/docs/guide/coverage.md                         | Vitest 공식 문서                            |
| ref/vitest-v4/docs/guide/mocking.md                          | Vitest 공식 문서                            |
| ref/vitest-v4/docs/guide/reporters.md                        | Vitest 공식 문서                            |
| ref/vitest-v4/docs/guide/parallelism.md                      | Vitest 공식 문서                            |
| ref/nextjs-v16/docs/01-app/02-guides/testing/vitest.mdx      | Next.js 공식 문서                           |
| ref/nextjs-v16/docs/01-app/01-getting-started/08-caching.mdx | Next.js 공식 문서                           |
| ref/playwright-v1.58/docs/src/best-practices-js.md           | Playwright 공식 문서                        |
| ref/playwright-v1.58/docs/src/ci.md                          | Playwright 공식 문서                        |

### 웹검색

| 주제                      | 출처                                                                |
| ------------------------- | ------------------------------------------------------------------- |
| CLAUDE.md 베스트 프랙티스 | code.claude.com/docs/en/best-practices                              |
| CLAUDE.md 10 Sections     | uxplanet.org/claude-md-best-practices-1ef4f861ce7c                  |
| Claude Code Hooks 가이드  | code.claude.com/docs/en/hooks                                       |
| Hooks 20+ 예시            | aiorg.dev/blog/claude-code-hooks                                    |
| Harness Engineering       | martinfowler.com/articles/exploring-gen-ai/harness-engineering.html |
| 하네스 가이드             | philschmid.de/agent-harness-2026                                    |
| Nx 모노레포 AI 스킬       | nx.dev/blog/nx-ai-agent-skills                                      |
| STATE 파일 패턴           | dev.to/builtbyzac/the-state-file                                    |
| 컨텍스트 백업 훅          | claudefa.st/blog/tools/hooks/context-recovery-hook                  |
| 세션 메모리 컴팩션        | platform.claude.com/cookbook/misc-session-memory-compaction         |
