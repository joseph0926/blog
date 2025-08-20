# 개발 블로그

![kyh-blog](https://github.com/user-attachments/assets/57fed4a0-fd95-4724-b4c7-21cc73f9756b)

타입 안전성과 개발자 경험에 집중한 개인 블로그 프로젝트

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 문제 정의 및 해결

**문제: API 타입 정의의 중복**

- 서버 액션과 REST API에서 동일한 타입을 각각 정의
- 타입 불일치 위험 및 유지보수 비용 증가
  → **해결: tRPC 도입으로 End-to-End 타입 안전성 구현 (코드량 35% 감소)**

**문제: 정적 콘텐츠의 비효율적인 데이터 fetching**

- 변경 빈도가 낮은 콘텐츠임에도 매 요청마다 DB 조회
- 불필요한 서버 부하 및 응답 지연
  → **해결: 콘텐츠 특성별 캐싱 전략 적용 (응답 속도 2배 향상)**

## 기술 스택

### Core

- **Frontend**: React 19, Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **API Layer**: tRPC v11, Prisma ORM
- **Content**: MDX with interactive components

### Infrastructure

- **Authentication**: Custom JWT implementation
- **Caching**: Next.js unstable_cache with tag-based revalidation
- **Monitoring**: Custom RUM (Real User Monitoring)
- **Testing**: Vitest, React Testing Library

## 주요 성과

- 코드베이스 35% 감소 (tRPC 리팩토링)
- 빌드 시간 40% 단축
- Lighthouse 성능 점수 95+
- 완전한 타입 안전성 달성

## 핵심 기능

### 1. tRPC 기반 통합 API

- 서버와 클라이언트 간 자동 타입 추론
- Zod를 활용한 런타임 타입 검증
- 일관된 에러 처리 패턴

### 2. 스마트 캐싱 시스템

- 글 목록: 5분 캐시 (자주 업데이트)
- 개별 포스트: 1시간 캐시 (거의 변경 없음)
- 태그 기반 즉시 무효화

### 3. MDX 인터랙티브 컴포넌트

- 포스트 내 실행 가능한 코드 샘플
- React Fiber 시각화 도구
- Suspense 데모 컴포넌트

## 실행 방법

```bash
pnpm dev

pnpm test

pnpm build
```

> 이 프로젝트는 Prisma DB와 환경 변수 설정이 필요합니다.
> 코드 구조와 구현 방식을 확인하시려면 아래 주요 파일을 참고해주세요.

## 프로젝트 구조

```
src/
├── app/              # Next.js 15 App Router
│   ├── (root)/      # 공개 페이지
│   ├── admin/       # 관리자 페이지
│   └── api/         # API 라우트
├── server/
│   └── trpc/        # tRPC 라우터 및 프로시저
├── components/
│   ├── ui/          # shadcn/ui 컴포넌트
│   └── mdx/         # MDX 전용 컴포넌트
├── mdx/             # 블로그 포스트 콘텐츠
└── lib/             # 유틸리티 및 헬퍼
```

## 주요 코드

- [tRPC 라우터 구현](./src/server/trpc/routers/post.ts)
- [캐싱 전략](./src/server/trpc/routers/post.ts#L30-L60)
- [MDX 컴포넌트](./src/mdx/components/)

## 블로그 포스트

- [React Fiber 아키텍처 시각화](./src/mdx/2025-06-25-react-react-fiber.mdx)
- [Suspense 성능 비교 데모](./src/mdx/2025-07-13-learn-react-02-suspense-.mdx)
- [tRPC 마이그레이션 과정](./src/mdx/2025-08-15-trpc-01-rest-api-api-.mdx)

---

**Author**: 김영훈 (joseph0926)
