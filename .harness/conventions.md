---
updated: 2026-07-26
baseline_revision: 314c3f0be6976711d8629cc39d25f85748e32baa
status: current
---

# 이 저장소에서 어떻게 쓰나

## 코딩

스타일은 도구가 소유한다. 여기 규칙을 복제하지 않는다.

| 무엇                 | 소유자                                                     |
| -------------------- | ---------------------------------------------------------- |
| lint 규칙            | `eslint.config.mjs`                                        |
| 포맷                 | `prettier.config.mjs`                                      |
| 타입                 | `apps/blog/tsconfig.json`, `packages/ui/tsconfig.json`     |
| shadcn 컴포넌트 생성 | `apps/blog/components.json`, `packages/ui/components.json` |

이 저장소에서만 참인 것:

- lint gate가 `--max-warnings 10`이다. 경고를 늘리는 변경은 빠르게 한도를 넘긴다.
- **`mdx/components/**`는 안티패턴을 일부러 보여주는 교육용 데모를 포함한다.** 여기의 lint 위반과 `eslint-disable`은 결함이 아니라 의도일 수 있다. 무심코 "고치기" 전에 그 컴포넌트가 무엇을 시연하는지 확인한다. 예: `suspense/traditional-loading-demo.tsx`는 Suspense와 대비시키려고 전통적 로딩 패턴을 그대로 보여준다.
- 글은 `apps/blog/src/mdx/`에 `YYYY-MM-DD-<slug>.mdx`로 두고, 영어판은 같은 이름에 `.en.mdx`를 쓴다. 영어판이 없으면 한국어 원문으로 대체된다.
- UI 문구는 컴포넌트에 하드코딩하지 않고 `apps/blog/messages/`의 ko/en에 넣는다.

## git

`git-suggest` 스킬이 이 절을 1순위 source of truth로 읽는다.

### 커밋 메시지

Conventional Commits. 히스토리에서 확인되는 type: `feat` `fix` `refactor` `chore` `docs`.

```
feat: home 페이지 uiux 개선
fix: RSC prefetch <-> client query-key 불일치 수정
refactor: 타입 재사용하도록 수정
chore: pnpm 버전 업 (v11.15.1)
docs: react-query-custom-hook-responsibility-boundaries
```

- scope는 쓰지 않는다.
- 제목은 한국어와 영어를 섞어 쓴다. 코드 식별자·기술명은 원문을 유지한다.
- `docs:`는 README 갱신뿐 아니라 **새 글 추가**에도 쓴다. 이때 제목은 글 slug다.
- 티켓 번호 체계는 없다.
- 본문은 대부분 비어 있다. 이유 설명이 필요할 때만 붙인다.

### 브랜치

`main`이 기본이자 배포 브랜치다. 작업 브랜치는 `type/slug`를 쓴다(예: `migrate/turbo`). 사용자명 prefix는 쓰지 않는다.

### PR

`.github/pull_request_template.md`의 섹션 구조를 그대로 채운다. 이슈 템플릿은 `.github/ISSUE_TEMPLATE/`에 있다. 호스트는 GitHub이므로 MR이 아니라 PR이다.

## 하지 않는 것

- `pnpm` 외의 package manager를 쓰지 않는다. `packageManager` 필드가 버전까지 고정한다.
- `apps/blog/src/generated/`를 손으로 고치지 않는다.
- `.env`·`.env.local`을 읽거나 커밋하지 않는다.
- 공개 저장소이므로 `.harness/`와 커밋 메시지에 미공개 계획이나 개인 정보를 넣지 않는다.

인터뷰에서 별도로 수집한 금지 경로나 이번 분기 보류 리팩토링은 없다. 생기면 sync 모드로 여기에 추가한다.
