---
updated: 2026-07-26
baseline_revision: 314c3f0be6976711d8629cc39d25f85748e32baa
status: current
---

# 현재 어떻고 어디로 가나

**현재 절은 코드에서 확인한 사실이고, 목표 절은 아직 비어 있다.** 둘을 섞어 읽지 않는다.

## 원칙

2026-07-26 확정. 모든 변경에 적용된다.

### 1. 필터 URL은 SSR 대상이다

`?category` `?q` `?year`가 붙은 목록 URL도 서버에서 데이터를 채워 내려보내고 크롤 가능해야 한다. 그래서 `app/[locale]/blog/page.tsx`가 `searchParams`를 읽고 request-time으로 렌더된다.

이건 갈림길에서 내린 선택이다 — `[[react-query/nextjs-app-router-filter-ssr]]`는 *"필터 URL도 SSR data를 가져야 하는가, 아니면 client-only filter로 충분한가를 먼저 고른다"*고 본다. 반대편(정적 shell + `useSearchParams` client island)을 고르면 필터별 server prefetch를 포기하게 된다. **이 원칙을 모르고 `force-dynamic`을 떼거나 필터를 client-only로 내리면 SEO가 조용히 깨진다.**

### 2. server prefetch와 client hook은 같은 identity를 쓴다

필터 정규화와 query 입력은 `lib/post-query.ts` 한 곳에서만 만든다. server가 dehydrate한 entry와 client observer가 읽는 entry가 달라지면 그건 fetcher 버그가 아니라 **data identity 버그**다 — 실제로 한 번 겪었다(`b719c1e`).

← `[[react-query/nextjs-app-router-filter-ssr]]`: _"필터 object를 server와 client에서 따로 만들면 key drift가 생기기 쉽다"_

### 3. tRPC는 남기되 그 이유를 안다

Prisma를 제거해 DB가 사라졌는데도 tRPC를 유지하는 근거는 **무한스크롤이다.** `fetchNextPage`는 클라이언트 상호작용이라 순수 RSC로는 안 된다.

`[[architecture/api-boundary-and-contract-design]]`의 프로토콜 표는 "내부 TS 코드베이스, 같은 저장소 frontend↔backend"에 tRPC를 놓아 이 저장소와 맞는다. 다만 같은 페이지 판단 규칙에 *"RSC 중심 앱에서 tRPC 대신 server component + server action으로 충분하지 않은지 확인했는가?"*가 있다. **무한스크롤 요구가 사라지면 이 근거도 사라진다** — 그때 다시 묻는다.

### 4. 도메인 경계

- 서버 계약은 tRPC 라우터가, 도메인 로직은 `services/`가 소유한다. 컴포넌트가 서비스를 직접 호출하지 않는다.
- 글은 DB가 아니라 저장소 파일이다. 콘텐츠 변경은 배포로 반영된다.
- 모든 라우트가 locale 세그먼트 아래 있다. locale 없는 라우트를 새로 만들지 않는다.

## 현재 아키텍처

### 렌더링과 라우팅

Next.js 16 App Router. 모든 페이지가 `app/[locale]/` 아래 있고 `(root)`·`blog`·`post` 세그먼트로 나뉜다. `next-intl`이 locale을 잡고, `messages/`의 ko/en 사전이 UI 문구를 공급한다. 영어 번역이 없는 글은 한국어 원문으로 대체된다.

`error.tsx`·`not-found.tsx`가 locale 레이아웃과 `post` 세그먼트 양쪽에 있다.

### 데이터 흐름

```
mdx 파일 → services/post.service.ts → server/trpc/routers → lib/trpc (클라이언트)
                                                          → TanStack Query 캐시 → 컴포넌트
```

- `server/trpc/root.ts`가 라우터를 합성하고 `context.ts`가 요청 컨텍스트를 만든다.
- `lib/query-key.ts`와 `lib/post-query.ts`가 쿼리 키와 조회 헬퍼를 소유한다. **RSC prefetch와 클라이언트 쿼리 키가 어긋나면 캐시가 두 벌이 된다** — 과거에 실제로 고친 문제다(`b719c1e`).
- `schemas/`의 Zod 스키마가 런타임 경계를 검증한다.

### 콘텐츠

`src/mdx/**`의 MDX를 `next-mdx-remote`로 렌더하고 `gray-matter`로 frontmatter를 읽는다. 읽기 시간 계산, 목록·상세, 검색·필터의 URL 동기화가 앱 레벨에 있다. 인터랙티브 예제 컴포넌트는 MDX에서 지연 로드된다.

### UI

Tailwind CSS 4 + Radix + Motion. 공유 컴포넌트는 `packages/ui`, 앱 전용은 `apps/blog/src/components`. 양쪽 다 shadcn 방식으로 컴포넌트를 가져온다.

### 빌드와 배포

Turborepo가 `dev`/`build`/`type-check`/`lint:fix`/`clean`을 오케스트레이션한다. GitHub Actions가 `main`에서 검증하고, 배포 대상은 `joseph0926.com`이다.

## 목표 아키텍처

원칙은 그대로 두고 **구현 형태만** 두 가지를 올린다. 방향 전환이 아니라 같은 원칙의 더 나은 실현이다.

### T1. query identity 공유를 factory 수준으로 올린다

지금은 `getPostsQueryInput`으로 **입력만** 공유한다. `getNextPageParam`과 `staleTime: 5분`은 클라이언트에만 있어서 stale 정책이 양쪽에서 따로 움직인다.

목표는 `lib/post-query.ts`에 `postsInfiniteQueryOptions(locale, filter)` factory를 두고 server prefetch와 client hook이 그걸 재사용하는 것이다. `getPostsQueryInput`은 그 안으로 흡수한다.

← `[[react-query/nextjs-app-router-filter-ssr]]`: _"`queryOptions`/`infiniteQueryOptions` factory를 server prefetch와 client hook에서 재사용한다"_, _"같은 factory를 쓰면 `queryKey`, `queryFn`, stale policy가 함께 움직인다"_

원칙 2를 더 강하게 만드는 변경이다. 입력만 맞추면 키는 맞지만 정책 drift는 남는다.

### T2. request-time 범위를 라우트에서 boundary로 좁힌다

지금은 `export const dynamic = 'force-dynamic'`이 라우트 전체를 request-time으로 만든다. 실제로 요청마다 달라야 하는 건 필터 목록뿐이고, 헤더·타이틀·SEO 껍데기는 정적이어도 된다.

목표는 static shell을 유지하고 필터 목록만 Suspense boundary 아래 request-time island로 내리는 것이다. `force-dynamic`은 제거한다.

← `[[nextjs/rendering-architecture]]`: _"Request-time API는 shared layout에 올리지 말고 local Suspense boundary로 격리한다"_, _"PPR은 route-wide mode가 아니라 boundary 배치 결과로 리뷰한다"_, _"재사용 가능한 data/UI는 cache boundary로 분리하고, request마다 달라야 하는 값은 request-time으로 남긴다"_

**주의**: 원칙 1을 깨지 않아야 한다. 필터별 SSR data는 그대로 유지하면서 정적 부분만 분리하는 것이다. Next 16 Cache Components(`cacheComponents`)를 켜기로 하면 이 작업은 그 마이그레이션과 묶인다.

## 갭

| 목표             | 현재                                                       | debt 행      |
| ---------------- | ---------------------------------------------------------- | ------------ |
| T1 factory 공유  | `getPostsQueryInput` 입력만 공유, stale 정책은 client 전용 | `debt.md` D5 |
| T2 boundary 격리 | 라우트 전체 `force-dynamic`                                | `debt.md` D6 |

목표와 무관하게 관찰된 부채 4건이 따로 있다: UI 테스트 공백(D1), MDX 데모의 룰 위반 의도 미표시(D2), `no-unused-vars` 설정 문제(D3), dead `QUERY_KEY`(D4).

D4는 원칙 2와 직접 얽힌다 — 사용처 0인 키 생성 지점이 남아 있으면 다음 사람이 그걸 identity 소스로 오해할 수 있다.
