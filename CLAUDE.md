# CLAUDE.md

개인 기술 블로그. Turbo + pnpm 모노레포.

## 스택

Next.js 16 (App Router) / tRPC 11 / Prisma 7 / PostgreSQL / TypeScript strict
UI: Radix + Tailwind v4 / 콘텐츠: MDX / 다국어: next-intl (ko, en)

## 구조

apps/blog/ — 메인 앱
packages/ui/ — 공유 UI 컴포넌트
의존 방향: apps → packages (단방향, 역참조 금지)

## 검증

모든 작업 완료 전:
./scripts/verify.sh

개별 실행:
pnpm lint # ESLint
pnpm --filter @joseph0926/blog format:check # Prettier
pnpm type-check # tsc --noEmit
pnpm --filter @joseph0926/blog test:ci # Vitest
pnpm build # Next.js 빌드

## 테스트 규칙

- 새 기능 → 테스트 동반 필수
- 버그 수정 → 재현 테스트 먼저
- Async Server Component → Playwright E2E (vitest 불가)
- 동기 컴포넌트/유틸/서비스 → Vitest

## 금지

- server-only 모듈을 클라이언트에서 import
- packages/ui → apps/\* 역참조
- 코드 읽기 전 변경 제안

## 세션 상태

새 세션/compact 후 → .harness/<토픽>/state.md 먼저 읽고 이어서 작업.
세션 종료 시 → state.md 갱신 + log.md에 이력 추가.

## 상세 문서

- [docs/architecture.md](docs/architecture.md) — 기술 스택, 디렉토리 책임, 데이터 흐름, 캐싱
- [docs/testing.md](docs/testing.md) — 테스트 전략 (Unit/Integration/E2E), 패턴, 규칙
- [docs/conventions.md](docs/conventions.md) — 코드 컨벤션, 네이밍, import 규칙
