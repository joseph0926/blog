# Task: visual.spec.ts 비주얼 리그레션 테스트

Status: completed
Created: 2026-03-21

## Scope

- e2e/visual.spec.ts (NEW) — toHaveScreenshot 비주얼 리그레션

## Steps

- [x] 1. 홈페이지 비주얼 스냅샷 테스트
- [x] 2. 블로그 목록 비주얼 스냅샷 테스트
- [x] 3. 로그인 페이지 비주얼 스냅샷 테스트

## Acceptance Criteria

- [x] e2e/visual.spec.ts 존재
- [x] 유효한 Playwright 구문 (toHaveScreenshot)

## Notes

- 3개 테스트: home.png, blog-list.png, login.png
- maxDiffPixelRatio: 0.01로 폰트 렌더링 차이 허용
- 첫 실행 시 --update-snapshots로 baseline 생성 필요
