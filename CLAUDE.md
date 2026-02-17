# CLAUDE.md

## Repository Working Agreement

새 기능 구현은 아래 3단계 문서 흐름으로 진행한다.

1. RFC 단계

- 사용자와 QnA로 요구사항/범위/수용기준을 확정한다.
- 경로: `docs/rfcs/<주제>.md`
- 사용자가 `docs/rfc/<주제>.md`라고 요청해도 동일 단계로 취급한다.

2. Plan 단계

- RFC 확정 후 구현 계획을 구체화한다.
- 경로: `docs/plan/<주제>.md`

3. Implementation 단계

- Plan 확정 후 구현하고 결과를 기록한다.
- 구현 근거(중요): 선택한 방식의 이유, 제약, 트레이드오프를 반드시 명시한다.
- 경로: `docs/impl/<주제>.md`

## Completed Docs Rule

- 문서 첫 줄이 `<!-- AI_STATUS: COMPLETED -->`면 완료로 간주한다.
- 완료 문서는 명시적 수정 요청이 없으면 다른 AI는 추가 분석 없이 early return 한다.
