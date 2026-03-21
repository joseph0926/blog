# Task: CI 강화 (coverage + Playwright)

Status: completed
Created: 2026-03-21

## Scope

- .github/workflows/ci.yml (MODIFY) — test:ci --coverage + Playwright 단계 추가

## Steps

- [x] 1. test:ci 명령에 --coverage 플래그 추가
- [x] 2. Playwright install 단계 추가 (chromium --with-deps)
- [x] 3. Playwright test 실행 단계 추가 (환경변수 포함)
- [x] 4. playwright-report 아티팩트 업로드 단계 추가 (failure 시)

## Acceptance Criteria

- [x] ci.yml의 Run tests 단계에 --coverage 포함
- [x] ci.yml에 Install Playwright 단계 존재
- [x] ci.yml에 Run E2E tests 단계 존재
- [x] ci.yml에 Upload Playwright report 단계 존재 (if: failure())

## Notes
