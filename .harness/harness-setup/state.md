## STATE (updated: 2026-03-21 15:30)

Goal: 하네스 도입 (Phase 1 + Phase 2)
Constraints: 기존 CI 파이프라인 유지, 파괴적 변경 없음
Progress:

- [x] docs/architecture.md 작성
- [x] docs/testing.md 작성
- [x] docs/conventions.md 작성
- [x] CLAUDE.md 작성 (목차 패턴)
- [x] scripts/verify.sh 생성
- [x] .husky/pre-push 교체
- [x] .claude/settings.json hooks 생성
- [x] vitest.config.ts 개선 (clearMocks, perFile, reporters)
- [x] .harness/ 초기화 + .gitignore
- [x] .harness/README.md (운영 규칙 + 템플릿)
- [ ] Playwright 설치 + config
- [ ] e2e/admin.spec.ts 작성
- [ ] ci.yml: test:ci --coverage
- [ ] ci.yml: Playwright 단계 추가
      Next: Playwright 설치 + e2e/playwright.config.ts 생성
      Blocked: 없음
      Files:
- CLAUDE.md (NEW)
- docs/architecture.md (NEW)
- docs/testing.md (NEW)
- docs/conventions.md (NEW)
- scripts/verify.sh (NEW)
- .husky/pre-push (MODIFY)
- .claude/settings.json (NEW)
- .gitignore (MODIFY)
- apps/blog/vitest.config.ts (MODIFY)
- .harness/README.md (NEW)
