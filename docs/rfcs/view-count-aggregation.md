<!-- AI_STATUS: DRAFT -->

# RFC: 조회수 집계

- 작성일: 2026-02-17
- 상태: Draft (Q&A 반영)
- 대상 서비스: `apps/blog`

## 1) Summary

MDX 기반 블로그 포스트에 대해 서버 측 조회수 집계를 도입한다. 지표는 `uniqueViews` 중심으로 운영하며, UI 노출은 포스트 상세 페이지에 한정한다. 목록 카드 즉시 노출은 하지 않되, 내부 인기글 정렬 기준으로 활용한다.

## 2) Background

현재 코드베이스에서 포스트 데이터는 MDX 파일(`apps/blog/src/services/post.service.ts`)을 단일 소스로 사용하고 있으며, 조회수 저장/조회 필드는 존재하지 않는다.

- `apps/blog/prisma/schema.prisma`: 조회수 관련 모델 부재
- `apps/blog/src/components/post/post-header.tsx`: 날짜/읽기 시간만 노출, 조회수 UI 없음
- `apps/blog/src/server/trpc/routers/post.ts`: 조회수 관련 procedure 없음

## 3) Goals

1. 포스트 상세 조회 시 조회수를 서버에서 집계한다.
2. 동일 사용자의 과도한 반복 조회를 완화한다(최소 24시간 단위 dedupe).
3. 인기글 정렬에 사용할 수 있는 일관된 지표를 제공한다.
4. 운영 중에도 성능 저하를 최소화한다.

## 4) Non-goals

1. 외부 분석 도구(GA4 등) 수준의 세션/퍼널 분석 제공
2. 관리자 대시보드 고도화(기간 비교, 차트, 필터)
3. 과거 트래픽의 완전한 소급 복원
4. 목록 카드에서 조회수 즉시 노출
5. `totalViews`(원시 히트 카운트) 저장/노출

## 5) Constraints

1. 기존 스택(Next.js App Router + tRPC + Prisma + PostgreSQL) 내에서 구현한다.
2. 개인정보(IP 원문) 저장은 피하고 해시 기반 키만 저장한다.
3. 기존 MDX 소스 구조는 유지한다(포스트 본문 저장 전략 변경 없음).
4. ko/en 번역 포스트 조회수는 `slug` 기준으로 통합 집계한다.
5. 1차 저장소는 PostgreSQL로 하며, Redis를 도입하더라도 조회수 단일 소스로 사용하지 않는다.
6. Vercel Analytics/Speed Insights는 관측(모니터링) 용도로만 사용하고, 인기글 정렬의 원본 데이터 소스로 사용하지 않는다.

## 6) Proposal

### 6.1 데이터 모델 (Prisma)

신규 모델 2개를 추가한다.

1. `PostViewCounter`

- `slug` (PK)
- `uniqueViews` (Int, default 0)
- `updatedAt`

2. `PostViewDailyVisitor`

- `id` (cuid)
- `slug`
- `day` (Date)
- `visitorHash` (String)
- `createdAt`
- Unique Index: `(slug, day, visitorHash)`

설계 이유:

- 카운터/중복제거 테이블을 분리해 조회는 빠르게, 쓰기는 멱등하게 처리한다.
- dedupe를 일 단위로 제한해 테이블 폭증을 완화한다.
- 현재 요구(인기글 정렬/상세 노출)에는 `uniqueViews`만으로 충분하다.

### 6.2 집계 규칙

1. 포스트 상세 페이지 진입 시 `hit` API를 1회 호출한다.
2. 서버는 `slug`, 요청 헤더(UA, IP 계열), 서버 시각으로 `visitorHash`를 생성한다.
3. `PostViewDailyVisitor`에 insert를 시도한다(Unique Key: `slug + day + visitorHash`).
4. 삽입 성공 시에만 `PostViewCounter.uniqueViews`를 `+1` 한다.
5. Unique 충돌 시 카운터는 증가시키지 않는다.

### 6.3 API 계약

1. `POST /api/post-views/hit`

- Request: `{ slug: string }`
- Response: `{ ok: true, counted: boolean }`
- 실패 시에도 페이지 렌더를 막지 않는다(fire-and-forget).

2. tRPC query 추가

- `post.getPostViews({ slug })`
- Response: `{ uniqueViews: number }`

3. 기존 `post.getPostBySlug` 확장(선택)

- 응답에 `views` 포함 가능. 단, 캐시 충돌을 피하기 위해 분리 query를 우선 권장.

4. 인기글 정렬용 query(내부 활용)

- `post.getPosts({ sort: 'latest' | 'popular' })` 또는 `post.getPopularPosts({ limit })` 중 하나를 Plan 단계에서 확정한다.

### 6.4 캐시/정합성

1. 조회수는 실시간성이 필요하므로 `unstable_cache` 장기 캐시에 직접 섞지 않는다.
2. 포스트 본문/메타 캐시(`post-${locale}-${slug}`)와 조회수 캐시를 분리한다.
3. 조회수 query는 짧은 TTL(예: 30~60초) 또는 no-store 전략을 적용한다.

### 6.5 봇/악성 트래픽 완화

1. UA 기반 bot 패턴(googlebot, bingbot 등) 기본 차단
2. 비정상 빈도(IP+slug 초당 다건) 발생 시 rate-limit 적용 준비
3. 실패/차단은 에러로 노출하지 않고 서버 로그/메트릭으로만 집계

### 6.6 저장소 선택 (PostgreSQL vs Redis)

1. 1차 채택안은 PostgreSQL이다.
2. 이유:

- 현재 스택과 정합성이 높고(Prisma), 운영 복잡도가 낮다.
- 조회수는 정확성/내구성이 중요하며, 재시작/장애 시 유실 위험이 낮다.

3. Redis는 현재 미채택(Rejected for now)이다.
4. Redis 재검토 트리거(모두 측정 기반):

- PostgreSQL 쓰기 병목이 실측으로 확인될 때(예: 조회수 집계 관련 p95/p99 지연이 SLO 초과)
- 트래픽 급증으로 인해 버퍼링/레이트리밋 계층이 반드시 필요하다고 판단될 때
- 도입 시 내구성/동기화/복구 전략이 함께 합의될 때

5. Redis 도입 시 역할은 보조 계층으로 제한한다:

- 허용: rate-limit, 단기 캐시, write-buffer
- 비허용: 조회수 원본 데이터(Source of Truth) 단독 저장소

### 6.7 Vercel 활용 방침

1. Vercel Analytics/Speed Insights는 운영 관측(트래픽/성능 추세 확인) 용도로 유지한다.
2. 인기글 정렬, 조회수 API 응답, 제품 로직의 기준 데이터는 PostgreSQL 집계값(`uniqueViews`)만 사용한다.
3. 이유:

- 플랜/요금/기능 제약 변화와 무관하게 제품 로직을 안정적으로 유지할 수 있다.
- 외부 분석 도구 데이터 접근 제약으로 인한 정합성 리스크를 줄일 수 있다.

## 7) Alternatives Considered

1. Vercel Analytics 데이터만 사용

- 장점: 구현 단순
- 단점: 앱 내부 조회수 API와 정합성/재가공 제약
- 결론: 관측 보조 용도로만 사용, 인기글 정렬의 원본 소스로는 미채택

2. 이벤트 원장 단일 테이블만 운영

- 장점: 분석 유연성
- 단점: read 성능/스토리지 비용 증가

3. Redis 단독 카운터

- 장점: 쓰기 처리량 유리
- 단점: 영속성/복구/정합성 관리 비용 증가, 현 시점 과설계 가능성
- 결론: 현재 요구 범위에서는 미채택

채택안은 `PostgreSQL + 카운터 + 일단위 dedupe` 혼합 모델이다.

## 8) Rollout Plan

1. Phase 1: DB 스키마 + hit API + 단위 테스트
2. Phase 2: 포스트 상세 UI에 조회수 노출(`PostHeader`)
3. Phase 3: 인기글 정렬 로직 적용(목록 카드 조회수 숫자 노출은 제외) + 운영 모니터링

## 9) Acceptance Criteria

1. 포스트 상세 진입 후 `uniqueViews`가 정책에 맞게 증가한다.
2. 동일 방문자의 동일 일자 반복 조회 시 `uniqueViews`는 1회만 증가한다.
3. 조회수 집계 실패가 포스트 페이지 렌더 실패를 유발하지 않는다.
4. 인기글 정렬이 `uniqueViews` 기준으로 동작한다.
5. 기본 페이지 응답 지연 증가가 허용 범위 내다(p95 +30ms 이내 목표).

## 10) Risks / Edge Cases

1. CDN/프록시 환경에서 IP 헤더 신뢰도 차이
2. NAT 환경에서 unique 과소/과대 집계 가능성
3. 인기글 정렬 쿼리 도입 시 목록 API의 인덱스/성능 영향 검토 필요

## 11) Q&A 결정사항 (2026-02-17)

1. 상세 페이지 외 목록 카드 조회수 즉시 노출: 하지 않음
2. 집계 지표: `totalViews` 미저장, `uniqueViews` 중심 운영
3. 로케일 정책: ko/en 통합 집계(`slug` 기준)
4. 저장소: PostgreSQL 채택, Redis는 현재 미채택(재검토 시에도 보조 역할만 허용)
5. Vercel: Analytics/Speed Insights는 관측용으로만 유지, 정렬/조회수 원본 소스로는 미채택

---

다음 단계: RFC 합의 기준으로 Plan 문서(`docs/plan/view-count-aggregation.md`)를 작성한다.
