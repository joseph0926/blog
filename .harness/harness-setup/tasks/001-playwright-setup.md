# Task: Playwright 설치 + config

Status: completed
Created: 2026-03-21

## Scope

- package.json (MODIFY) — @playwright/test devDependency 추가
- e2e/playwright.config.ts (NEW) — Playwright config 생성

## Steps

- [x] 1. pnpm add -Dw @playwright/test
- [x] 2. npx playwright install chromium --with-deps
- [x] 3. e2e/playwright.config.ts 작성 (plan.md 섹션 13 참조)

## Acceptance Criteria

- [x] @playwright/test가 package.json devDependencies에 존재
- [x] e2e/playwright.config.ts가 존재하고 올바른 설정 포함
- [x] npx playwright --version 성공 (v1.58.2)

## Notes
