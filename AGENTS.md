# AGENTS.md

## 시작 전

작업을 시작하기 전에 `.harness/index.md`를 먼저 읽는다. 저장소 구조, 컨벤션, 검증 명령, 아키텍처는 그 문서가 라우팅한다. 저장소를 처음부터 탐색하지 않는다.

`.harness/index.md`가 가리키지 않는 범위만 직접 탐색한다.

## 소유 경계

- 저장소 소개, 기능 목록, 기술 스택 표는 `README.md`가 소유한다.
- 작업용 지도·컨벤션·검증·아키텍처는 `.harness/**`가 소유한다.
- 글 콘텐츠는 `apps/blog/src/mdx/**` 파일이 소유한다.

같은 사실을 두 곳에 복제하지 않는다. 문서를 고칠 때는 위 소유자 중 한 곳만 고친다.

## 작업 규칙

- `pnpm` 외의 package manager를 쓰지 않는다. `package.json#packageManager`가 버전까지 고정한다.
- `scripts/verify.sh`는 `pnpm lint:fix`로 시작해 **파일을 고친다.** 읽기 전용 확인에는 `.harness/verification.md`의 개별 명령을 쓴다.
- 새 의존성 추가나 파괴적 변경 전에는 확인을 구한다.
- `.env`, `.env.local`을 읽거나 커밋하지 않는다.
- 공개 저장소다. 커밋 메시지와 추적되는 문서에 미공개 계획이나 개인 정보를 넣지 않는다.

## 완료 조건

- `.harness/verification.md`의 변경 유형별 최소 lane을 실제로 실행했다.
- 실행한 명령과 실제 결과를 보고에 포함한다.
- 구조나 컨벤션이 바뀌었으면 `.harness/`의 해당 문서도 함께 갱신한다.
