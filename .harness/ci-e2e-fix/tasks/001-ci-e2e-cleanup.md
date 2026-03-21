# Task: CI E2E 제거 + 스펙 정리

Status: completed
Created: 2026-03-21

## Scope

- .github/workflows/ci.yml (MODIFY) — E2E 관련 3단계 제거 (Playwright install, E2E run, artifact upload)
- e2e/admin.spec.ts (DELETE) — 사용하지 않는 admin 기능 테스트
- e2e/visual.spec.ts (DELETE) — 스냅샷 기반 비교 제거, Playwright MCP로 대체
- .harness/README.md (MODIFY) — 시각화 정책에 playwright-mcp 추가

## Steps

- [x] 1. ci.yml에서 91-106행 (Install Playwright + Run E2E + Upload report) 제거
- [x] 2. e2e/admin.spec.ts 삭제
- [x] 3. e2e/visual.spec.ts 삭제
- [x] 4. .harness/README.md 시각화 정책에 playwright-mcp 추가
- [x] 5. verify.sh 실행하여 검증

## Acceptance Criteria

- [x] ci.yml에 playwright/e2e 관련 단계가 없음
- [x] e2e/admin.spec.ts 파일 미존재
- [x] e2e/visual.spec.ts 파일 미존재
- [x] .harness/README.md에 playwright-mcp 시각화 정책 포함
- [x] verify.sh 통과

## Notes
