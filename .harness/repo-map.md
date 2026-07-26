---
updated: 2026-07-26
baseline_revision: 314c3f0be6976711d8629cc39d25f85748e32baa
status: current
---

# 어디에 무엇이 있나

기능 목록과 기술 스택 표는 `README.md`가 소유한다. 이 문서는 **코드를 찾을 때** 보는 지도다.

## 워크스페이스

pnpm workspace 2개. `pnpm-workspace.yaml`이 `apps/*`와 `packages/*`를 잡는다.

| 경로          | 패키지명           | 역할                                   |
| ------------- | ------------------ | -------------------------------------- |
| `apps/blog`   | `@joseph0926/blog` | Next.js 앱 본체. 거의 모든 변경이 여기 |
| `packages/ui` | —                  | 앱과 공유하는 UI 컴포넌트·스타일       |

루트 `package.json`은 `turbo`로 위임만 한다(`dev`/`build`/`type-check`/`lint:fix`/`clean`). 실제 스크립트는 `apps/blog/package.json`에 있다.

## `apps/blog/src` 지도

| 경로                                                                  | 담는 것                                                                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `app/[locale]/`                                                       | 라우트. `(root)`, `blog`, `post` + `layout`/`error`/`not-found`                                 |
| `app/api/`, `app/sitemap.ts`, `app/robots.ts`                         | API 라우트와 SEO 엔드포인트                                                                     |
| `server/trpc/`                                                        | tRPC 서버. `root.ts`(라우터 합성), `routers/`, `context.ts`, `trpc.ts`, `query-client.ts`       |
| `services/`                                                           | 도메인 로직. `post.service.ts`와 `post/`                                                        |
| `lib/`                                                                | 경계 유틸. `trpc.ts`(클라이언트), `query-key.ts`, `post-query.ts`, `env.ts`, `generate-post.ts` |
| `schemas/`                                                            | Zod 스키마                                                                                      |
| `components/`                                                         | `about` `blog` `home` `post` `layouts` `loading` `ui`                                           |
| `mdx/`                                                                | **글 원문.** `YYYY-MM-DD-<slug>.mdx`와 `.en.mdx` 쌍                                             |
| `i18n/`, `messages/`                                                  | next-intl 설정과 UI 문구(앱 루트의 `messages/`)                                                 |
| `hooks/`, `providers/`, `constants/`, `meta/`, `types/`, `generated/` | 이름대로                                                                                        |
| `__tests__/`                                                          | Vitest. `hooks` `lib` `schemas` `server` `services` 하위로 미러링                               |
| `proxy.ts`                                                            | 프록시 진입점                                                                                   |

## Entrypoint

| 무엇             | 파일                                                     |
| ---------------- | -------------------------------------------------------- |
| 앱 렌더 진입     | `apps/blog/src/app/[locale]/layout.tsx`                  |
| tRPC 라우터 합성 | `apps/blog/src/server/trpc/root.ts`                      |
| tRPC 클라이언트  | `apps/blog/src/lib/trpc.ts`                              |
| 글 로딩          | `apps/blog/src/services/post.service.ts`                 |
| Next 설정        | `apps/blog/next.config.ts`                               |
| 테스트 설정      | `apps/blog/vitest.config.ts`, `e2e/playwright.config.ts` |
| 로컬 검증        | `scripts/verify.sh`                                      |

## 소유 경계

- **글 콘텐츠**는 DB가 아니라 `apps/blog/src/mdx/**` 파일이 소유한다. 글을 추가·수정하는 작업은 코드가 아니라 이 디렉터리를 건드린다.
- **서버 계약**은 `server/trpc/routers/**`가, **도메인 로직**은 `services/**`가 소유한다. 컴포넌트에서 서비스 로직을 직접 부르지 않는다.
- **공유 UI**는 `packages/ui`, **앱 전용 UI**는 `apps/blog/src/components`. 둘 다 `components.json`(shadcn)을 각자 갖는다.
- **e2e**는 워크스페이스 밖 루트 `e2e/`에 있다. `apps/blog` 안이 아니다.

## 런타임과 도구

| 항목            | 값               | 근거                          |
| --------------- | ---------------- | ----------------------------- |
| Node            | 24               | `.nvmrc`                      |
| package manager | `pnpm@11.15.1`   | `package.json#packageManager` |
| 태스크 러너     | Turborepo        | `turbo.json`                  |
| 의존성 고정     | `pnpm-lock.yaml` | —                             |

`pnpm-workspace.yaml`에 `overrides`(postcss, uuid, tmp)와 `onlyBuiltDependencies` 목록이 있다. 네이티브 빌드가 필요한 패키지를 추가하면 여기도 손대야 한다.

## git 추적되지 않는 자산

git 추적 여부만으로 부재를 단정하지 않는다. `.gitignore`가 다음을 제외한다.

| 경로                                                 | 내용                                  |
| ---------------------------------------------------- | ------------------------------------- |
| `artifacts/`                                         | `uiux-experiments/` — UI 실험 산출물  |
| `.claude/settings.local.json`, `.claude/launch.json` | Claude Code 로컬 설정                 |
| `.codex/`                                            | 현재 없음. `.gitignore`에는 남아 있다 |

`.harness/`는 예외적으로 추적된다.
