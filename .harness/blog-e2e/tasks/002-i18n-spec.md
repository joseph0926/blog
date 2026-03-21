# Task: i18n.spec.ts 다국어 E2E 테스트

Status: completed
Created: 2026-03-21

## Scope

- e2e/i18n.spec.ts (NEW) — ko ↔ en 전환 E2E 테스트

## Steps

- [x] 1. ko 홈페이지 접근 + 한국어 텍스트 확인
- [x] 2. LocaleSwitcher로 en 전환 + URL /en/ 확인 + 영어 텍스트 확인
- [x] 3. /en/blog 접근 후 ko 전환 + /ko/blog 확인

## Acceptance Criteria

- [x] e2e/i18n.spec.ts 존재
- [x] 유효한 Playwright 구문

## Notes

- 3개 테스트: ko 홈 텍스트, ko→en 전환, en→ko 블로그 전환
