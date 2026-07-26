---
updated: 2026-07-26
baseline_revision: 314c3f0be6976711d8629cc39d25f85748e32baa
status: current
---

# 무엇으로 확인하나

## ⚠️ `scripts/verify.sh`는 읽기 전용이 아니다

첫 단계가 `pnpm lint:fix`라 **파일을 고친다.** 상태를 바꾸지 않고 확인만 하려면 개별 명령을 쓴다. `pre-push` 훅이 이걸 통째로 돌리므로 push 직전에는 자동 실행된다.

## 명령 표

전부 저장소 루트에서 실행한다.

| 명령                                          | 증명하는 것      | gate                 | 비고                             |
| --------------------------------------------- | ---------------- | -------------------- | -------------------------------- |
| `pnpm type-check`                             | 타입 계약        | CI 필수 + pre-commit | turbo 위임                       |
| `pnpm --filter @joseph0926/blog lint`         | ESLint           | CI 필수              | `--max-warnings 10`              |
| `pnpm --filter @joseph0926/blog format:check` | Prettier         | CI 필수              | 읽기 전용                        |
| `pnpm --filter @joseph0926/blog test:ci`      | Vitest 단위·통합 | CI 필수              | CI는 `--coverage` 추가           |
| `pnpm build`                                  | Next 빌드 통과   | CI 필수              | 가장 느림                        |
| `pnpm --filter @joseph0926/blog lint:fix`     | —                | —                    | **수정함.** `--max-warnings 100` |

e2e(`e2e/*.spec.ts`, Playwright)는 CI gate에 없다. 라우팅·i18n을 건드렸을 때만 수동으로 돌린다.

## 변경 유형별 최소 lane

| 바꾼 것                                               | 최소한 이건 돌린다                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| 글 MDX만 (`src/mdx/**`)                               | `format:check`                                                    |
| 컴포넌트·훅                                           | `type-check` + `test:ci`                                          |
| tRPC 라우터·서비스·스키마                             | `type-check` + `test:ci`. 계약이 바뀌면 소비 측 컴포넌트까지 확인 |
| 라우트·i18n (`app/[locale]/**`, `i18n/`, `messages/`) | `type-check` + `test:ci` + e2e 수동                               |
| 의존성·workspace·turbo 설정                           | `pnpm build`까지 전부                                             |

## 자동 강제되는 것

| 층                         | 무엇이 막나                                                                      |
| -------------------------- | -------------------------------------------------------------------------------- |
| `.husky/pre-commit`        | `pnpm type-check` + `pnpm lint-staged`                                           |
| `.husky/pre-push`          | `./scripts/verify.sh` 전체                                                       |
| `.github/workflows/ci.yml` | `main` push·PR에서 lint → format:check → type-check → test:ci --coverage → build |

CI는 `@joseph0926/blog` 필터로 lint/format/type-check/test를 돌리고 `pnpm build`만 전체를 돈다. `packages/ui`만 고쳤을 때 lint가 CI에서 안 잡힐 수 있으므로 로컬에서 확인한다.

## 실행 판단

- 로컬에서 못 도는 검증은 현재 없다. CI와 같은 명령이 그대로 돈다.
- 커버리지 임계는 설정돼 있지 않다(`fix: 테스트 커버리지 제한 삭제`, `85bbd81`). `--coverage`는 리포트만 낸다.
- 알려진 flaky lane은 관찰된 것이 없다.
