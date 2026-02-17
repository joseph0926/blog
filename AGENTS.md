# AGENTS.md

## Default

- 기본 응답 언어는 한국어다.

## Feature Workflow (Mandatory)

새 기능 구현 요청 시 아래 순서를 반드시 따른다.

1. RFC 합의

- 사용자와 QnA를 통해 요구사항을 먼저 확정한다.
- 문서 경로: `docs/rfcs/<주제>.md`
- 참고: 사용자가 `docs/rfc/<주제>.md`라고 표현해도 동일 의미로 처리한다.

2. Plan 확정

- RFC가 합의되면 실행 계획을 작성/합의한다.
- 문서 경로: `docs/plan/<주제>.md`

3. Implementation

- Plan이 합의되면 구현을 진행한다.
- 구현 근거(왜 이렇게 구현했는지, 대안 대비 이유 포함)를 반드시 남긴다.
- 문서 경로: `docs/impl/<주제>.md`

## Completion Marker Rule

- 문서 첫 줄이 `<!-- AI_STATUS: COMPLETED -->`면 완료 문서로 간주한다.
- 완료 문서는 사용자가 명시적으로 수정 요청하지 않는 한, 다른 AI 채팅에서 즉시 종료(early return)한다.
