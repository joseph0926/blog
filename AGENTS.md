# Blog repository guide

이 저장소는 MDX 기술 글과 이를 제공하는 Next.js 애플리케이션을 함께 운영한다. 가까운 `AGENTS.md`가 더 구체적인 경계를 소유한다.

## Source of truth

- 제품 구조와 명령: `README.md`, `package.json`, `apps/blog/package.json`
- 저장소 고유 용어: `CONTEXT.md`
- 되돌리기 어려운 결정과 이유: `docs/adr/*.md`
- 실제 동작: 코드, schema와 test
- 완료 판정: `scripts/verify.sh`와 해당 validator

`AGENTS.md`에는 routing과 작업 경계만 둔다. 동작을 설명하는 산문이 코드나 test와 충돌하면 실행 계약을 먼저 확인하고 충돌을 보고한다.

## 작업 시작 계약

편집 전에 다음을 짧게 고정한다.

- Goal과 관찰 가능한 acceptance
- 변경 가능한 owner와 예상 경로
- non-goal과 이번 작업에서 하지 않을 정리
- 사용할 검증 profile과 필요한 사람 확인

기존 변경을 보존한다. `.env`, `.env.local`, `.env.*`는 읽거나 수정하지 않는다.

## 검증 profile

- `content`: MDX 본문, frontmatter, 번역과 정적 자산만 변경한다.
- `product`: 애플리케이션, 공유 UI, server API와 빌드 기반만 변경한다.
- `integrated`: 두 경계를 함께 변경하거나 교육 데모를 변경한다.

Profile은 작업 의미가 아니라 검증 preset이다. 편집 뒤 실제 경로와 대조하고 불확실하면 `integrated`로만 승격한다.

```sh
./scripts/verify.sh --profile content --stage quick
./scripts/verify.sh --profile product --stage final
./scripts/verify.sh --profile integrated --stage final
```

- `quick`은 반복 중 빠른 feedback에 사용한다.
- `final`은 완료 직전에 한 번 실행한다.
- `product`와 `integrated`의 final에는 E2E가 포함된다.
- 모든 검증은 Git에 보이는 작업 파일을 수정하지 않아야 한다.

## 작업 흐름

1. 가까운 지침, 관련 코드, test와 prior decision을 읽는다.
2. 가장 작은 owner 경계에서 변경한다.
3. Quick 검증으로 feedback을 받고 실패 원인을 바꿔 재시도한다.
4. Final 검증과 필요한 사람 확인으로 acceptance를 닫는다.
5. 실제 변경이 시작 계약에 속하는지 확인하고 completion receipt를 남긴다.

입력이나 접근을 바꾼 시도는 최대 3회다. 같은 오류가 두 번 반복되면 중단하고 마지막 증거와 미완료 조건을 보고한다.

## 권한 경계

요청 범위의 로컬 코드와 문서 변경, 관련 검증은 수행할 수 있다. 새 의존성, Git 쓰기, 배포, 외부 게시와 파괴적 변경은 사용자의 명시적 요청 없이는 수행하지 않는다.

## Completion receipt

최종 응답에는 다음을 포함한다.

- 시작 계약과 선택한 검증 profile
- 실제 변경 파일과 acceptance의 대응
- 번역 작업의 `sourceHash`와 `anti-slop-english` 최종 검수 결과
- 실행한 quick/final 명령과 결과
- E2E 결과 또는 적용 제외 이유
- 미완료 항목, 남은 위험과 사람 확인 항목
