# 웹 애플리케이션 캐싱: 전체 레이어 학습 플랜

> Next.js · React · React Query · tRPC · Turborepo 스택에서 캐싱이 동작하는 전체 레이어를 이해하고, 각 레이어별 올바른 전략과 안티패턴을 구분하기 위한 학습 플랜입니다.

## 학습 범위

| 레이어                   | 메커니즘                                     | 캐시 대상                    |
| ------------------------ | -------------------------------------------- | ---------------------------- |
| **Request** (React)      | `React.cache()`                              | 같은 요청 내 중복 fetch 제거 |
| **Render** (React)       | `useMemo`, `React.memo`                      | 컴포넌트/계산 결과           |
| **Data** (Next.js)       | `fetch` + `next: { revalidate, tags }`       | 서버 데이터 응답             |
| **Route** (Next.js)      | Full Route Cache, `use cache`                | 정적 라우트 HTML/RSC         |
| **Query** (React Query)  | `staleTime` + `gcTime` + `invalidateQueries` | 클라이언트 서버 상태         |
| **Build/CI** (Turborepo) | 태스크 해시 + Remote Cache                   | 빌드 아티팩트                |

## 문서 구조 (예정)

| 파일                                                       | Phase | 내용                                                | 난이도 |
| ---------------------------------------------------------- | ----- | --------------------------------------------------- | ------ |
| [01-mental-model.md](./01-mental-model.md)                 | 1     | 캐시 멘탈 모델 (히트/미스/무효화, 6레이어 개관)     | ★☆☆    |
| [02-react-render-cache.md](./02-react-render-cache.md)     | 2     | React 렌더 캐시 (memo, useMemo, React.cache)        | ★★☆    |
| [03-nextjs-4-layer.md](./03-nextjs-4-layer.md)             | 3     | Next.js 4계층 캐시 (Request/Data/Route/Router)      | ★★★    |
| [04-nextjs-use-cache.md](./04-nextjs-use-cache.md)         | 3     | Next.js `use cache` (cacheLife, cacheTag)           | ★★★    |
| [05-react-query-cache.md](./05-react-query-cache.md)       | 4     | React Query 캐시 (staleTime/gcTime, queryKey 설계)  | ★★☆    |
| [06-react-query-patterns.md](./06-react-query-patterns.md) | 4     | Optimistic Update, SSR Hydration 패턴               | ★★☆    |
| [07-trpc-integration.md](./07-trpc-integration.md)         | 5     | tRPC + React Query 통합 캐시 무효화                 | ★★☆    |
| [08-build-ci-cache.md](./08-build-ci-cache.md)             | 6     | Turborepo/CI 빌드 캐시                              | ★★☆    |
| [09-scenarios.md](./09-scenarios.md)                       | 7     | 종합 시나리오 (CRUD 흐름, 병목 진단, 불일치 디버깅) | ★★★    |

> 각 파일은 학습 진행에 따라 생성됩니다. 체크리스트/퀴즈 복습 노트도 추가될 수 있습니다.

---

## Phase 1: 캐싱 멘탈 모델 (기초)

**목표**: "캐시란 무엇이고, 왜 레이어별로 다른가"를 설명할 수 있다

| #   | 주제                   | 핵심 질문                                                                      |
| --- | ---------------------- | ------------------------------------------------------------------------------ |
| 1-1 | 캐시의 본질            | 캐시 히트/미스/무효화(invalidation)의 트레이드오프는?                          |
| 1-2 | 웹 앱 캐시 레이어 개관 | Request → Render → Data → Route → Query → CI 각 레이어의 역할 차이는?          |
| 1-3 | 신선도 vs 일관성       | `staleTime`, `revalidate`, `max-age`는 각각 어떤 계층에서 신선도를 제어하는가? |

**체크포인트**: 6개 레이어를 그리고, 각 레이어의 캐시 대상/수명/무효화 트리거를 설명할 수 있다

---

## Phase 2: React 렌더링 캐시

**목표**: React의 렌더 최적화 메커니즘이 "캐싱"과 어떻게 연결되는지 이해한다

| #   | 주제                        | 핵심 질문                                                                  |
| --- | --------------------------- | -------------------------------------------------------------------------- |
| 2-1 | `React.memo` & shallowEqual | memo가 bailout하는 조건 3가지는? 인라인 객체가 왜 문제인가?                |
| 2-2 | `useMemo` / `useCallback`   | "비교 비용 < 렌더 비용"일 때만 사용하라는 원칙의 판단 기준은?              |
| 2-3 | `React.cache()` (서버)      | 서버 컴포넌트에서 `cache()`가 요청 단위 중복제거를 하는 원리는?            |
| 2-4 | 안티패턴                    | Props→state 복사, Effect로 파생 상태, 불안정 key가 캐시를 깨뜨리는 이유는? |

**체크포인트**: "이 컴포넌트가 불필요하게 리렌더되는 이유"를 3가지 패턴으로 진단할 수 있다

---

## Phase 3: Next.js 4-Layer 캐시

**목표**: Next.js App Router의 4계층 캐시를 각각 설정하고 무효화할 수 있다

| #   | 주제                      | 핵심 질문                                                                          |
| --- | ------------------------- | ---------------------------------------------------------------------------------- |
| 3-1 | Request Memoization       | 같은 요청 내 `fetch()` 중복 호출이 자동 제거되는 범위와 조건은?                    |
| 3-2 | Data Cache                | `next: { revalidate, tags }` 옵션이 데이터 캐시의 수명과 무효화를 제어하는 방식은? |
| 3-3 | Full Route Cache          | 정적 vs 동적 라우트의 캐시 동작 차이는? PPR과의 관계는?                            |
| 3-4 | Router Cache (Client)     | 클라이언트 라우터 캐시의 기본 TTL과 `staleTimes` 설정 효과는?                      |
| 3-5 | `use cache` (Next.js 16+) | `cacheLife()`, `cacheTag()`, `updateTag()`로 컴포넌트 단위 캐시를 제어하는 패턴은? |
| 3-6 | 안티패턴                  | `cache: 'no-store'` 남용, `revalidatePath('/')` 과다 호출의 영향은?                |

**체크포인트**: 블로그 포스트 목록 페이지의 캐시 전략을 "어떤 레이어에서, 어떤 TTL로, 어떻게 무효화"하는지 설계할 수 있다

---

## Phase 4: React Query 캐시

**목표**: 클라이언트 상태 캐시의 생명주기를 완전히 이해하고 전략을 선택할 수 있다

| #   | 주제               | 핵심 질문                                                                   |
| --- | ------------------ | --------------------------------------------------------------------------- |
| 4-1 | staleTime / gcTime | 두 값이 캐시 상태 전이(fresh→stale→inactive→GC)에 미치는 영향은?            |
| 4-2 | queryKey 설계      | 팩토리 패턴(`todoKeys.list(filters)`)이 무효화 그룹화에 유리한 이유는?      |
| 4-3 | Structural Sharing | 깊은 비교로 참조를 안정화하는 원리와 `select()`의 역할은?                   |
| 4-4 | Optimistic Updates | `cancelQueries` + `onMutate` + `onSettled` 3단계 패턴이 필요한 이유는?      |
| 4-5 | SSR Hydration      | 서버 prefetch → `HydrationBoundary` → 클라이언트 전달 흐름은?               |
| 4-6 | 안티패턴           | queryKey 변수 누락, useState로 쿼리 데이터 복사, staleTime 미설정의 결과는? |

**체크포인트**: "서버 프리페치 → 클라이언트 하이드레이션 → 뮤테이션 후 무효화" 전체 흐름을 코드로 작성할 수 있다

---

## Phase 5: tRPC + React Query 통합 캐시

**목표**: tRPC 환경에서 캐시 무효화와 optimistic update를 올바르게 구현할 수 있다

| #   | 주제                        | 핵심 질문                                                                         |
| --- | --------------------------- | --------------------------------------------------------------------------------- |
| 5-1 | tRPC queryKey 구조          | `[['trpc', procedure, ...]]` 형태의 자동 생성 키와 수동 무효화 방법은?            |
| 5-2 | 서버/클라이언트 캐시 동기화 | Next.js `revalidateTag` + React Query `invalidateQueries`를 함께 사용하는 패턴은? |

**체크포인트**: 블로그 포스트 생성 mutation 후, 서버 캐시와 클라이언트 캐시를 모두 올바르게 무효화하는 코드를 작성할 수 있다

---

## Phase 6: 빌드/CI 캐시

**목표**: 개발 생산성에 직결되는 빌드 캐시를 최적화할 수 있다

| #   | 주제            | 핵심 질문                                                                       |
| --- | --------------- | ------------------------------------------------------------------------------- |
| 6-1 | Turborepo 캐시  | 태스크 해시 구성 요소(inputs/outputs/env)와 캐시 미스 디버깅 방법은?            |
| 6-2 | CI 캐시 키 설계 | OS + Node 버전 + lockfile 해시가 캐시 키에 필요한 이유와 `restore-keys` 함정은? |
| 6-3 | 안티패턴        | `envMode: "loose"`, node_modules 전체 캐시, 너무 넓은 restore-keys의 문제는?    |

**체크포인트**: `turbo run build --summarize`로 캐시 미스 원인을 진단하고 해결할 수 있다

---

## Phase 7: 종합 시나리오

**목표**: 실제 프로젝트에서 전체 캐시 레이어를 통합 설계할 수 있다

| #   | 시나리오           | 설명                                                                      |
| --- | ------------------ | ------------------------------------------------------------------------- |
| 7-1 | 블로그 포스트 CRUD | 작성 → 목록 캐시 무효화 → 개별 포스트 캐시 → 사이트맵 갱신 전체 흐름 설계 |
| 7-2 | 성능 병목 진단     | "페이지가 느리다" → 어떤 레이어의 캐시를 의심하고 어떻게 측정하는가?      |
| 7-3 | 캐시 불일치 디버깅 | "수정했는데 반영이 안 된다" → 4계층 중 어디가 stale인지 추적하는 방법     |

---

## 학습 순서

```
Phase 1 (멘탈 모델) ─── 필수 선행
    │
    ├── Phase 2 (React 렌더 캐시)
    │       │
    │       └── Phase 3 (Next.js 4-Layer)
    │               │
    │               ├── Phase 4 (React Query)
    │               │       │
    │               │       └── Phase 5 (tRPC 통합)
    │               │
    │               └── Phase 7 (종합 시나리오) ← 마지막
    │
    └── Phase 6 (빌드/CI) ─── 독립, 언제든 가능
```

## 빠른 시작

```bash
# Phase 1부터 Active Recall 루프 시작
/study-aio ask 캐싱 멘탈 모델

# 특정 Phase 진입
/study-aio ask Next.js 4-Layer 캐시
/study-aio ask React Query staleTime gcTime

# 현재 프로젝트 기반 실습
/study-aio ask 블로그 포스트 CRUD 캐시 무효화 흐름
```

## 참고 스킬

| 스킬              | 주요 참고 파일                                                                    |
| ----------------- | --------------------------------------------------------------------------------- |
| `nextjs-aio`      | `references/caching.md`, `references/best-practices/cache-components.md`          |
| `react-aio`       | `references/memo.md`, `references/patterns.md`                                    |
| `react-query-aio` | `references/caching.md`, `references/patterns.md`                                 |
| `turborepo-aio`   | `references/caching.md`                                                           |
| `ci-aio`          | `references/caching.md`                                                           |
| `master-aio`      | `recipes/trpc-react-query-next-cache.md`, `recipes/next-react-query-hydration.md` |

---

_작성일: 2026-02-07_
