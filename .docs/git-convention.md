# Git Convention

- 브랜치명: `type/short-slug` 형식을 사용한다. 예: `chore/replace-blog-ai-harness`, `feat/improve-about-page`.
- 커밋 메시지: scope를 생략한 conventional commits 형식 `type: 한국어 제목`을 사용한다. 제목은 한 줄로 간결하게 쓴다. 예: `chore: 블로그 AI 하네스 전면 교체`, `docs: 글 번역 추가`.
- PR 본문: `.github/pull_request_template.md`의 `PR 내용`, `관련 이슈`, `변경 사항` 구조를 유지하고, 실행한 검증과 알려진 경고를 필요한 경우 뒤에 추가한다.
- 근거: 2026-08-28 기준 최근 non-merge 커밋 30개가 `docs:`, `chore:`, `feat:`, `fix:`, `refactor:`와 한국어 제목을 사용했다. 저장소는 GitHub를 사용하고 branch 표본은 기본 branch 외에 충분하지 않아 `type/short-slug`를 기본값으로 채택했다.
