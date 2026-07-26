---
updated: 2026-07-26
baseline_revision: 314c3f0be6976711d8629cc39d25f85748e32baa
status: current
---

# .harness/ — 이 저장소 작업 라우터

작업을 시작할 때 이 문서를 먼저 읽는다. 저장소를 다시 탐색하지 않기 위한 문서 세트이며, 나머지 6개 문서는 여기서 라우팅된다.

## 읽는 순서

| 하려는 일                 | 읽을 문서                                            |
| ------------------------- | ---------------------------------------------------- |
| 버그 수정, 코드 위치 찾기 | `repo-map.md`                                        |
| 새 기능·섹션 추가         | `architecture.md` → `repo-map.md` → `conventions.md` |
| 리팩토링                  | `debt.md` → `decisions.md` → `architecture.md`       |
| 커밋·브랜치·PR            | `conventions.md`                                     |
| 완료 판정, 무엇을 돌릴지  | `verification.md`                                    |
| 왜 이렇게 되어 있는지     | `decisions.md`                                       |

전부 읽지 않는다. 위 표에서 해당하는 것만 읽고, 부족하면 그 문서가 가리키는 실제 파일로 내려간다.

## 작업 파이프라인

```
작업 시작  → .harness/index.md → 해당 문서 (탐색 대체)
코딩 전    → research-query (아키텍처 방향·라이브러리 선택 판단이 걸릴 때만)
코딩 후    → verify-gate + research-query
문서 갱신  → bootstrap-repo-harness (sync 모드)
```

`research-query`는 매번 쓰지 않는다. 이 저장소 고유 사실은 이 문서들이 답하고, "이 기술이 어떻게 동작하는가"만 중앙 research wiki로 넘긴다.

## 배포 방식

git 추적된다. 공개 저장소이므로 이 디렉터리의 내용도 공개된다. 로컬 전용 메모, 자격증명, 미공개 계획을 넣지 않는다.

## 문서 상태

| 문서              | 담는 것                          | status        |
| ----------------- | -------------------------------- | ------------- |
| `repo-map.md`     | 어디에 무엇이 있나               | current       |
| `conventions.md`  | 이 저장소에서 어떻게 쓰나        | current       |
| `verification.md` | 무엇으로 확인하나                | current       |
| `architecture.md` | 원칙 4 + 현재 + 목표 T1·T2 + 갭  | current       |
| `decisions.md`    | 확정된 판단과 이유 (후보만 적재) | review-needed |
| `debt.md`         | 알려진 문제와 개선 방향 (D1~D6)  | current       |

`decisions.md`의 "왜" 3건(ESLint v10 롤백, Prisma 제거, 커버리지 임계 삭제)만 아직 비어 있다. `bootstrap-repo-harness`의 fill 모드로 채운다 — AI가 후보를 뽑아 오면 판정만 하면 된다.

**작업 전에 `architecture.md`의 원칙 4개를 먼저 읽는다.** 특히 원칙 1(필터 URL은 SSR 대상)은 모르고 건드리면 SEO가 조용히 깨진다.

## 경계

이 디렉터리가 소유하지 않는 것:

- 저장소 소개, 기능 목록, 기술 스택 표 → `README.md`가 소유한다. 여기서 복제하지 않는다.
- React/Next.js/tRPC 같은 기술 일반론 → 중앙 research wiki
- 글 콘텐츠 자체 → `apps/blog/src/mdx/**`
