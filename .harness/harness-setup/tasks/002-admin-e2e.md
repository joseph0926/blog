# Task: admin E2E 테스트 작성

Status: completed
Created: 2026-03-21

## Scope

- e2e/admin.spec.ts (NEW) — 로그인 + 게시글 관리 E2E 테스트

## Steps

- [x] 1. 로그인 페이지 접근 + 비밀번호 입력 + 로그인 테스트 작성
- [x] 2. 관리자 페이지 접근 + 게시글 목록 확인 테스트 작성
- [x] 3. 새 게시글 다이얼로그 열기 테스트 작성

## Acceptance Criteria

- [x] e2e/admin.spec.ts 존재
- [x] 테스트가 유효한 Playwright 구문

## Notes

- 4개 테스트: 로그인 페이지 렌더링, 로그인 성공, 게시글 목록, 다이얼로그 열기
- ADMIN_PASSWORD 환경변수로 비밀번호 주입 (기본값: 'test')
