# 코드베이스 분석 리포트

> 최종 업데이트: 2026-01-30
> 상태: 주요 P1 이슈 해결 완료, P2/P3 개선 진행 중

---

## 구조 (Architecture)

### 현황 분석

- **모노레포 구조(Turbo + pnpm workspace)**: `apps/blog`(Next.js)와 `packages/ui`(공용 UI 컴포넌트) 분리
- **App Router 구조**: `app/` 디렉토리에서 라우팅, `server/trpc/`에서 API, `services/`에서 비즈니스 로직
- **MDX 단일 소스 오브 트루스**: Post 도메인이 MDX 파일 기반으로 통일됨 ✅

### ✅ 해결된 항목

| 항목                               | 이전 문제                          | 해결 내용                                                                            |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| Post 도메인 이중 소스              | DB + MDX 분리로 동기화 리스크      | MDX를 단일 소스로 통일. `post.service.ts`가 MDX frontmatter에서 모든 메타데이터 추출 |
| 사이트맵 slug 불일치               | 날짜 제거로 404 유발               | `sitemap.ts`가 파일명 전체(날짜 포함)를 slug로 사용                                  |
| createPost slug/frontmatter 불일치 | base slug와 final slug 불일치 가능 | `generatePostContent`에 `finalSlug` 전달                                             |

### 🔄 진행 중/남은 항목

#### [P2] 중간 우선순위

| 항목                  | 문제점                                        | 개선안                                                | 난이도 |
| --------------------- | --------------------------------------------- | ----------------------------------------------------- | ------ |
| 루트 vitest.config.ts | 레거시로 남아있음 (apps/blog용이 별도 존재)   | 삭제 또는 workspace 설정으로 전환                     | 낮음   |
| 도메인별 모듈 구조    | 타입/서비스/스키마가 도메인별로 뭉쳐있지 않음 | `features/post/{components,services,types}` 점진 도입 | 중간   |

### 참고 파일

- `apps/blog/src/services/post.service.ts`: MDX 기반 포스트 CRUD
- `apps/blog/src/services/post/create-post.service.ts`: MDX 파일 생성
- `apps/blog/src/app/sitemap.ts`: MDX 기반 사이트맵 생성

---

## 코드 퀄리티 (Code Quality)

### 현황 분석

- `tsconfig.json`에서 `strict: true` 설정
- tRPC 입력에 `zod` 스키마 적용
- 컴포넌트/파일 네이밍 일관성 유지 (케밥 케이스)

### ✅ 해결된 항목

| 항목                                | 이전 문제                                     | 해결 내용                                            |
| ----------------------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `/admin` 인증 실패 시 404           | `/admin/login` 존재하지 않음                  | `/login`으로 리다이렉트 수정                         |
| 업로드 API 무인증                   | 누구나 Cloudinary 업로드 가능                 | `requireAdmin` 가드 + 파일 타입/크기 검증 추가       |
| revalidate API 무인증 + 태그 불일치 | `posts` 태그 사용 (실제와 불일치)             | 인증 추가 + `all-posts`, `post-${slug}` 태그 사용    |
| 테스트 설정 불일치                  | 루트 vitest.config가 apps/blog 경로 참조 불가 | `apps/blog/vitest.config.ts` 생성, 스크립트에서 명시 |
| 테스트 기대값 불일치                | 중복 slug throw 기대 vs 실제 suffix 생성      | 테스트를 실제 동작에 맞게 수정                       |
| ReactQueryDevtools 프로덕션 포함    | 항상 렌더링                                   | `process.env.NODE_ENV !== 'production'` 조건 추가    |

### 🔄 진행 중/남은 항목

#### [P2] 중간 우선순위

| 항목             | 문제점                               | 개선안                             | 난이도 |
| ---------------- | ------------------------------------ | ---------------------------------- | ------ |
| 타입/스키마 정리 | 일부 스키마가 실제 API와 불일치 가능 | `RouterOutputs` 기반으로 타입 추론 | 중간   |
| 콘솔 로그 정리   | 일부 파일에 console.log 존재         | 로거 유틸 도입 또는 제거           | 낮음   |
| 태그 정렬 일관성 | `getTags`에 orderBy 없음             | `orderBy: { name: 'asc' }` 적용    | 낮음   |

### 참고 파일

- `apps/blog/src/app/admin/layout.tsx`: 인증 리다이렉트 ✅
- `apps/blog/src/app/api/upload/route.ts`: 보안 강화 ✅
- `apps/blog/src/app/api/revalidate/route.ts`: 인증 + 태그 정합성 ✅
- `apps/blog/src/lib/auth/require-admin.ts`: Route Handler 인증 가드

---

## 자동화 (Automation)

### 현황 분석

- **Husky**: pre-commit (lint-staged)
- **GitHub Actions**: lint, format:check, type-check, test, build
- **테스트 DB**: postgres service (CI)

### ✅ 해결된 항목

| 항목                | 이전 문제                              | 해결 내용                                         |
| ------------------- | -------------------------------------- | ------------------------------------------------- |
| CI Node 버전 불일치 | CI는 Node 22, 프로젝트는 Node 24       | `node-version-file: '.nvmrc'` 사용                |
| CI lint:fix 실행    | 검증이 아닌 수정                       | `lint` (no fix) + `format:check` 사용             |
| 테스트 미실행       | DB 없이 테스트 불가                    | `services: postgres` + `db:test:push` + `test:ci` |
| vitest config 위치  | 루트 config가 apps/blog 경로 참조 불가 | `apps/blog/vitest.config.ts` 생성                 |

### 🔄 진행 중/남은 항목

#### [P2] 중간 우선순위

| 항목                 | 문제점                     | 개선안                               | 난이도    |
| -------------------- | -------------------------- | ------------------------------------ | --------- |
| 커버리지 품질 게이트 | 최소 커버리지 기준 없음    | `test:coverage` + 임계값 설정        | 중간      |
| E2E 테스트           | 핵심 플로우 회귀 방지 부족 | Playwright로 로그인/글 생성 시나리오 | 중간~높음 |

#### [P3] 낮은 우선순위

| 항목          | 문제점                       | 개선안                                | 난이도 |
| ------------- | ---------------------------- | ------------------------------------- | ------ |
| Lighthouse CI | lhci 의존성만 있고 설정 없음 | PR/주간 실행으로 Core Web Vitals 측정 | 중간   |

### 참고 파일

- `.github/workflows/ci.yml`: CI 파이프라인 ✅
- `apps/blog/vitest.config.ts`: 테스트 설정 ✅
- `apps/blog/docker-compose.test.yml`: 로컬 테스트 DB

---

## UI/UX

### 현황 분석

좋은 점:

- **Skip link** 제공 (`app/layout.tsx`)
- **prefers-reduced-motion** 대응 (`packages/ui/styles/globals.css`)
- **next/image** 사용, skeleton 로딩 컴포넌트 존재

### 🔄 진행 중/남은 항목

#### [P2] 중간 우선순위

| 항목                   | 문제점                                       | 개선안                                        | 난이도 |
| ---------------------- | -------------------------------------------- | --------------------------------------------- | ------ |
| FileUpload 접근성      | 클릭 div 기반, 키보드 조작 부족              | `role="button"`, `tabIndex`, `onKeyDown` 추가 | 중간   |
| 아이콘 버튼 aria-label | 썸네일 제거, 필터 버튼 등 라벨 없음          | `aria-label` 추가                             | 낮음   |
| 이미지 sizes 미지정    | next/image에 sizes 없어 다운로드 최적화 부족 | `sizes` 속성 추가                             | 낮음   |

#### [P3] 낮은 우선순위

| 항목                   | 문제점                        | 개선안                              | 난이도 |
| ---------------------- | ----------------------------- | ----------------------------------- | ------ |
| Infinite scroll 접근성 | 키보드/스크린리더 사용자 불편 | "더 보기" 버튼 fallback + aria-live | 중간   |
| 색상 토큰 일관성       | 일부 하드코딩된 색상          | CSS 변수/테마 기반으로 변경         | 낮음   |

### 참고 파일

- `apps/blog/src/components/ui/file-upload.tsx`: 업로더 접근성 개선 포인트
- `apps/blog/src/components/ui/floating.tsx`: 필터 버튼 aria-label 필요
- `apps/blog/src/components/blog/blog-post-card.tsx`: 이미지 sizes 최적화 포인트

---

## 완료 요약

### 해결된 P1 항목 (7개)

1. ✅ `/admin` 인증 실패 시 404 → `/login` 리다이렉트
2. ✅ `/api/upload` 무인증 → `requireAdmin` + 파일 검증
3. ✅ `/api/revalidate` 무인증 + 태그 불일치 → 인증 + 올바른 태그
4. ✅ sitemap 404 유발 → slug 규칙 통일
5. ✅ vitest 설정 불일치 → `apps/blog/vitest.config.ts`
6. ✅ CI 검증 파이프라인 → Node 버전, 테스트 단계 추가
7. ✅ Post 도메인 이중 소스 → MDX 단일 소스로 통일

### 남은 P2/P3 항목

- **P2 (6개)**: 루트 vitest.config 정리, UI/UX 접근성, 이미지 sizes, 커버리지 게이트, E2E 테스트, 타입/스키마 정리
- **P3 (3개)**: Lighthouse CI, Infinite scroll 접근성, 색상 토큰 일관성
