# Code Conventions

## 파일 네이밍

| 유형     | 패턴                    | 예시                                        |
| -------- | ----------------------- | ------------------------------------------- |
| 컴포넌트 | PascalCase              | `BlogPostCard.tsx`                          |
| 서비스   | kebab-case + `.service` | `post.service.ts`, `create-post.service.ts` |
| 타입     | kebab-case + `.type`    | `post.type.ts`                              |
| 유틸     | kebab-case              | `generate-post.ts`                          |
| 훅       | `use-` + kebab-case     | `use-mobile.ts`                             |
| 스키마   | kebab-case + `.schema`  | -                                           |
| 테스트   | 원본명 + `.test`        | `utils.test.ts`                             |

## 컴포넌트 패턴

### Server Component (기본)

```tsx
export const RecentBlogPosts = async ({ locale }: Props) => {
  const data = await fetchData();
  return <div>{...}</div>;
};
```

### Client Component

```tsx
'use client';
export const BlogFilter = ({ tags }: Props) => {
  const [selected, setSelected] = useState(null);
  return <div>{...}</div>;
};
```

### 판단 기준

- hooks, 이벤트 핸들러 필요 → `'use client'`
- async 데이터 페칭, 파일/DB 접근 → Server Component
- `import 'server-only'`로 서버 전용 모듈 명시

## Private 폴더

`_folderName` 접두사 → Next.js 라우팅에서 자동 제외.
라우트 그룹 내 공유 컴포넌트 배치에 사용.

예: `app/blog/_components/BlogPostCard.tsx`

## Export 패턴

- **Named export** 사용 (default export 지양)
- 타입: `export type TypeName = {...}`

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

- `publicProcedure`: 인증 불필요 (읽기)
- `protectedProcedure`: `isAuth` 미들웨어 통과 필수 (쓰기)
- 입력: Zod 스키마로 검증
- 에러: `TRPCError`로 던지기 (`code: UNAUTHORIZED, CONFLICT` 등)

## 에러 처리

| 위치            | 패턴                                                  |
| --------------- | ----------------------------------------------------- |
| tRPC router     | `throw new TRPCError({ code, message })`              |
| Route handler   | `NextResponse.json({ message }, { status })`          |
| 페이지 컴포넌트 | `notFound()` 또는 에러 UI                             |
| 인증 가드       | `requireAdmin()` → `null`(성공) 또는 `Response`(실패) |

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

- ID: `cuid()`
- 모든 테이블: `createdAt` + `updatedAt`
- 스키마 변경 → `pnpm db:gen` → `pnpm db:push`
- 마이그레이션: `prisma migrate dev` (개발), `prisma db push` (테스트)

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

무효화: `revalidateTag('all-posts-ko')` — 쓰기 mutation 후 반드시 호출.

## 다국어

- 기본 로케일: `ko` (URL 접두사 없음)
- 영문: `/en/...`
- MDX 파일: `slug.mdx` (한국어), `slug.en.mdx` (영어)
- 번역: `src/messages/{ko,en}.json` + `useTranslations('key')`
- 로케일 fallback: en 요청인데 en 파일 없으면 → ko 반환 + `isFallback: true`
