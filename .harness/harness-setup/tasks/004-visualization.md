# Task: 시각화 도입

Status: completed
Created: 2026-03-21

## Scope

- package.json (MODIFY) — @mermaid-js/mermaid-cli devDependency 추가
- .harness/README.md (MODIFY) — 시각화 정책 섹션 추가

## Steps

- [x] 1. pnpm add -Dw @mermaid-js/mermaid-cli
- [x] 2. Playwright MCP 등록 (claude mcp add)
- [x] 3. .harness/README.md에 시각화 정책 섹션 추가

## Acceptance Criteria

- [x] @mermaid-js/mermaid-cli가 package.json devDependencies에 존재
- [x] Playwright MCP 등록 완료
- [x] .harness/README.md에 시각화 정책 섹션 존재

## Notes

- puppeteer 빌드 스크립트 승인을 위해 package.json에 pnpm.onlyBuiltDependencies 추가
