# .harness/ — 세션 상태 관리

## 디렉토리 구조

```
.harness/
├── README.md                      # 이 파일 (운영 규칙 + 템플릿)
├── <토픽>/
│   ├── state.md                   # 현재 작업 상태
│   └── log.md                     # 세션 이력 (최대 10개)
└── archive/
    └── <토픽>-log-<YYYY-MM-DD>.md # 아카이브된 로그
```

## 토픽 생성 규칙

- **네이밍**: kebab-case, 작업 목적 1~2단어 (`harness-setup`, `auth-refactor`, `blog-e2e`)
- **생성 시점**: 새 작업 시작 시 `mkdir .harness/<토픽>` + state.md 초기화
- **한 세션 한 토픽**: 하나의 세션은 하나의 토픽만 활성화

## state.md 템플릿

새 토픽 생성 시 아래를 **그대로 복사**하여 사용. 필드를 추가/삭제하지 않는다.

```markdown
## STATE (updated: YYYY-MM-DD HH:MM)

Goal:
Constraints:
Progress:

- [ ] 항목1
- [ ] 항목2
      Next:
      Blocked:
      Files:
- 파일경로 (NEW|MODIFY|DELETE)
```

### 필드 설명

| 필드          | 설명                                    | 예시                         |
| ------------- | --------------------------------------- | ---------------------------- |
| `Goal`        | 현재 토픽의 최종 목표 (한 줄)           | `하네스 도입 Phase 1 완료`   |
| `Constraints` | 지켜야 할 제약사항                      | `기존 CI 파이프라인 유지`    |
| `Progress`    | 체크리스트 (완료: `[x]`, 미완료: `[ ]`) | `- [x] docs/architecture.md` |
| `Next`        | 바로 다음에 할 작업 (한 줄)             | `scripts/verify.sh 생성`     |
| `Blocked`     | 막힌 것 (없으면 `없음`)                 | `DB 연결 필요`               |
| `Files`       | 수정한 파일 목록 + 변경 유형            | `- CLAUDE.md (NEW)`          |

### 갱신 타이밍

1. **작업 시작 시** — Goal, Constraints, Progress 초기 항목 기록
2. **마일스톤 완료 시** — Progress 체크 + Next 갱신
3. **compact 전** — PreCompact 훅이 알림 → 현재 상태 반영
4. **세션 종료 시** — Stop 훅이 알림 → 최종 상태 반영

### 토픽 완료 시

Goal을 `완료`로 변경하고 더 이상 갱신하지 않는다.

```markdown
## STATE (updated: 2026-03-21 16:00)

Goal: 완료
```

## log.md 템플릿

각 세션 종료 시 아래 **엔트리 형식을 그대로** 사용하여 log.md 상단에 추가. 최신이 위.

```markdown
## YYYY-MM-DD 세션 N

- Goal: 이 세션의 목표
- Work: 수행한 작업 요약
- Result: 완료 | 진행중 | 차단됨
- Next: 다음 세션에서 할 것

---
```

### 필드 설명

| 필드     | 설명                               |
| -------- | ---------------------------------- |
| `Goal`   | 이 세션에서 달성하려 했던 것       |
| `Work`   | 실제로 한 작업 (파일명 포함)       |
| `Result` | `완료`, `진행중`, `차단됨` 중 하나 |
| `Next`   | 다음 세션에서 이어갈 작업          |

## 아카이브 규칙

log.md 엔트리가 **10개 초과** 시:

1. 가장 오래된 엔트리들을 `archive/<토픽>-log-<YYYY-MM-DD>.md`로 이동
2. log.md에는 최근 10개만 유지
3. 아카이브 파일 상단에 토픽명과 기간 기록:
   ```markdown
   # <토픽> 로그 아카이브 (YYYY-MM-DD ~ YYYY-MM-DD)
   ```

## 병렬 세션 충돌 방지

- 한 토픽 = 한 세션만 쓰기 가능
- 다른 세션은 같은 토픽의 state.md를 **읽기만** 가능
- 별도 작업은 별도 토픽 디렉토리 생성
