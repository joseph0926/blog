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

```
joseph0926/
├── apps/blog/          # 메인 블로그 앱 (Next.js)
└── packages/ui/        # 공유 UI 컴포넌트 (Radix + Tailwind)
```

의존 방향: `apps/blog → packages/ui` (단방향). 역참조 금지.

## apps/blog 디렉토리 책임

| 디렉토리           | 책임                              | 핵심 파일                     |
| ------------------ | --------------------------------- | ----------------------------- |
| `src/app/`         | 라우팅, 레이아웃, 메타데이터      | page.tsx, layout.tsx          |
| `src/components/`  | React 컴포넌트 (feature별 분리)   | about/, blog/, admin/, post/  |
| `src/server/trpc/` | tRPC 라우터, 컨텍스트, 미들웨어   | root.ts, context.ts, routers/ |
| `src/services/`    | 비즈니스 로직 (MDX 파일 I/O)      | post.service.ts               |
| `src/lib/`         | 유틸리티, 인증, Prisma 클라이언트 | auth/, prisma.ts, trpc.ts     |
| `src/types/`       | 타입 정의                         | post.type.ts, action.type.ts  |
| `src/hooks/`       | 클라이언트 훅                     | use-mobile.ts                 |
| `src/schemas/`     | Zod 검증 스키마                   | -                             |
| `src/mdx/`         | MDX 컴포넌트 레지스트리           | component-registry.ts         |
| `src/i18n/`        | 다국어 설정                       | routing.ts                    |
| `src/messages/`    | 번역 파일                         | ko.json, en.json              |
| `src/__tests__/`   | 테스트 (소스 구조 미러링)         | -                             |

## 데이터 흐름

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

## 인증 흐름

```
POST /api/trpc/auth.login
  → 비밀번호 검증 (argon2)
  → JWT 발급 (jose, HS256)
  → httpOnly 쿠키 설정
  → 이후 요청: 쿠키 → verifyAccessToken → ctx.user
```

## 라우트 구조

| 경로               | 유형    | 설명               |
| ------------------ | ------- | ------------------ |
| `/`                | SSG     | 홈 (최근 글)       |
| `/about`           | SSG     | 소개               |
| `/blog`            | SSG+ISR | 글 목록, 태그 필터 |
| `/post/[slug]`     | SSG+ISR | 개별 글            |
| `/en/...`          | SSG     | 영문 버전          |
| `/admin`           | CSR     | 관리자 대시보드    |
| `/login`           | CSR     | 로그인             |
| `/api/trpc/[trpc]` | API     | tRPC 엔드포인트    |
| `/api/upload`      | API     | 이미지 업로드      |
| `/api/revalidate`  | API     | ISR 재검증         |

## DB 스키마

```
User (id, email, password, createdAt, updatedAt)
  └→ RefreshToken (id, token, expiresAt, revoked, userId)

Post (id, slug, title, description, thumbnail, tags[], createdAt)
  └↔ Tag (id, name, posts[])  // M:N 관계
```

인덱스: `Post(createdAt, id)`, `RefreshToken(token)`

## 캐싱 전략

### 현재 패턴 (unstable_cache)

```tsx
unstable_cache(fn, keys, { tags, revalidate });
// 무효화: revalidateTag('all-posts-ko')
```

### Next.js 16 신규 패턴 (향후 마이그레이션 대상)

| 현재                             | Next.js 16                                                  |
| -------------------------------- | ----------------------------------------------------------- |
| `unstable_cache(fn, keys, opts)` | `'use cache'` + `cacheLife('hours')` + `cacheTag('posts')`  |
| `revalidateTag('tag')`           | `revalidateTag('tag')` (SWR) 또는 `updateTag('tag')` (즉시) |

마이그레이션 시기: `next.config.ts`에 `cacheComponents: true` 활성화 후.
