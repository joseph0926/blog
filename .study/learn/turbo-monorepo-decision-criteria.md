# turbo-monorepo-decision-criteria

> 최초 질문: $learn . 지금 이 프로젝트가 모노레포(turbo)일 필요가 있을까요? 그 선택/판단의 기준은 어떻게 잡을까요?
> 프로젝트: /Users/kimyounghoon/Downloads/@kyh/joseph0926
> 일시: 2026-03-03

## Q1. $learn . 지금 이 프로젝트가 모노레포(turbo)일 필요가 있을까요? 그 선택/판단의 기준은 어떻게 잡을까요?

## 패턴 매핑

현재는 **`Internal Shared Package`를 둔 경량 모노레포 패턴**입니다.  
`apps/blog`(앱) + `packages/ui`(공용 UI 패키지) 분리 구조입니다.

근거:

- 워크스페이스 범위: [pnpm-workspace.yaml](/Users/kimyounghoon/Downloads/@kyh/joseph0926/pnpm-workspace.yaml):1
- 모노레포 구조 명시 문서: [docs/review/analyze.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/review/analyze.md):12

## 코드 추적

- 루트 명령이 `turbo` 중심: [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):6
- 파이프라인은 `^build`, `^type-check` 등 다중 패키지 의존 그래프 전제: [turbo.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/turbo.json):4
- 앱은 `@joseph0926/ui`를 워크스페이스 의존으로 사용: [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):30
- 앱 빌드에서 `@joseph0926/ui`를 transpile 대상으로 처리: [apps/blog/next.config.ts](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/next.config.ts):14
- 앱 TS path도 `packages/ui` 직접 참조: [apps/blog/tsconfig.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/tsconfig.json):23
- 런타임 진입점에서도 UI 패키지 CSS/유틸 사용: [apps/blog/src/app/layout.tsx](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/src/app/layout.tsx):1
- CI는 대부분 blog만 `--filter` 검증하고, 빌드만 루트 실행: [.github/workflows/ci.yml](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.github/workflows/ci.yml):63
- 정량: `apps/blog/src`에서 `@joseph0926/ui` import 108회, `packages/ui/components` 파일 20개(명령 결과 기준)
- git 근거(판단 가능한 이력): `ca94a88 refactor.shadcn: packages/ui로 교체`

추론: **지금은 “모노레포가 반드시 필요”한 단계라기보다, “공유 UI 경계 유지” 목적에서 유효한 선택**입니다.  
추론: `packages/ui`에 독립 `build/test/type-check` 스크립트가 없어, Turbo 그래프 최적화 이득은 현재 제한적입니다.

## 시각화

```text
[6개월 내 독립 앱/패키지 2개 이상 계획?]
  ├─ 예 -> 모노레포 유지 (Turbo 유지)
  └─ 아니오
      [UI 패키지 독립 릴리즈/버저닝 필요?]
        ├─ 예 -> 모노레포 유지
        └─ 아니오
            [Turbo 캐시로 CI/로컬 시간이 20%+ 절감되는가?]
              ├─ 예 -> 모노레포 유지
              └─ 아니오 -> 단일 앱(Next)로 통합 검토
```

## 연결

### 프로젝트 내부

| 모듈/파일                     | 관계                | 근거                                                                                                                                                                                                                                            |
| ----------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json` ↔ `turbo.json` | 실행 오케스트레이션 | 루트 스크립트가 turbo task 실행 ([package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):6, [turbo.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/turbo.json):4)                                                        |
| `apps/blog` ↔ `packages/ui`   | 앱-공유UI 의존      | workspace 의존 + transpile + ts path ([apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):30, [apps/blog/next.config.ts](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/next.config.ts):14) |

### 학습 토픽

| 대상 토픽                    | 관계                               | 근거                                                                                                                                                                                                                                                            |
| ---------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/study/cache/README.md` | 빌드/CI 캐시 판단 기준과 직접 연결 | Turborepo 캐시를 Build/CI 레이어로 명시 ([docs/study/cache/README.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/study/cache/README.md):14, [docs/study/cache/README.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/study/cache/README.md):116) |

## Summary

현재 프로젝트에서 Turbo 모노레포는 **필수는 아니고 조건부로 타당**합니다.  
핵심 액션:

1. `6개월 로드맵` 기준으로 독립 앱/패키지 확장 계획 유무를 먼저 확정
2. `turbo --summarize`로 실제 캐시 절감률(예: 20%+) 측정
3. 계획/절감률 둘 다 낮으면 단일 앱 구조로 단순화 검토

## Files modified

- [.study/learn/session-state.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.study/learn/session-state.md):1 (+15, -0)

## Commands run

- `rg --files`, `rg -n ...`, `find ... | wc -l`, `nl -ba ...`, `git log --oneline ...`, `git status --short`

## How to verify

- `rg -n "@joseph0926/ui" apps/blog/src -g "*.{ts,tsx}" | wc -l`
- `nl -ba package.json | sed -n "1,40p"`
- `nl -ba turbo.json | sed -n "1,80p"`
- `nl -ba .github/workflows/ci.yml | sed -n "58,90p"`

## Risks & follow-ups

- 단일 앱으로 합치면 import 경로/설정/CI 스크립트 전환 비용이 큽니다(현재 UI import 108회).

## Q2. 시각화 기준 1번,2번 분기는 No이고 마지막 20% 측정을 해봐야할거같네요, 근데 보통 이건 전/후를 비교해야하는데 이미 turbo 모노레포로 구성되어있으면 전/후 비교가 어려운가요? 아니면 따로 방법이 있나요?

네, 가능합니다.  
정확히는 “과거의 진짜 before”는 없지만, **대체 before(반사실 baseline)**를 만들어 비교하면 됩니다.

## 패턴 매핑

지금 상황은 `Historical before/after`가 아니라 `Counterfactual A/B`가 맞습니다.  
즉, 같은 코드/같은 머신에서:

1. `turbo 경로`
2. `turbo 우회 경로(앱 직접 실행)`

를 나란히 재서 20% 기준을 판단합니다.

## 코드 추적

근거:

- 루트 빌드는 Turbo 경유: [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7
- 앱 직접 빌드는 가능: [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9
- CI도 이미 대부분 앱 단위 필터 실행: [.github/workflows/ci.yml](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.github/workflows/ci.yml):63
- 실행 근거: `turbo run build --dry-run=json` 결과에 task 2개(`@joseph0926/blog#build`, `@joseph0926/ui#build`)가 잡히고, `@joseph0926/ui#build` command가 `<NONEXISTENT>`로 표시됨  
  추론: 현재는 Turbo 그래프 이점이 크지 않을 수 있어, A/B 측정이 특히 유효합니다.

## 시각화

```text
A안(우회 baseline): /Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog build
B안(Turbo):        ./node_modules/.bin/turbo run build --filter=@joseph0926/blog --summarize

각 5회 실행 -> 중앙값 비교
절감률 = (A중앙값 - B중앙값) / A중앙값 * 100
기준: 20% 이상이면 Turbo 유지 근거 강화
```

권장 측정 축 3개:

1. Cold: `--force`로 캐시 무시한 Turbo vs baseline
2. Warm: 변경 없이 재실행 (실사용 체감)
3. Change impact: `apps/blog` 파일 변경 시/`packages/ui` 변경 시 어떤 task가 재실행되는지 (`--dry-run=json`)

## 이중 연결

프로젝트 내부 연결:

- 루트 Turbo 오케스트레이션([package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7)과 앱 직접 실행([apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9)이 둘 다 가능해서 A/B 실험이 가능합니다.

학습 토픽 연결:

- Turborepo 캐시 진단은 이미 학습 문서에 있음: [docs/study/cache/README.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/study/cache/README.md):120

세션 상태는 Q2로 갱신해뒀습니다: [.study/learn/session-state.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.study/learn/session-state.md):1

1. 원하시면 제가 바로 이 저장소에서 `build/type-check/lint` 3종 A/B 벤치마크를 실행해서 중앙값 표로 정리해드리겠습니다.

## Q3. --filter는 turbo를 안타고 순수 pnpm으로 동작하는건가요?

네, 정확히는 이렇게 보시면 됩니다.

## 패턴 매핑

`pnpm --filter`는 **실행기**가 아니라 **대상 패키지 선택자**입니다.  
실제로 Turbo를 타는지는 “선택된 패키지의 script 내용”이 결정합니다.

## 코드 추적

- 루트 `build`는 Turbo 실행: [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7
- `@joseph0926/blog`의 `build`는 `next build`: [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9

따라서:

- `pnpm --filter @joseph0926/blog build` -> **Turbo 안 탐** (`next build` 실행)
- `pnpm build` (루트에서) -> **Turbo 탐** (`turbo build` 실행)

추론: `--filter` 자체는 순수 pnpm 동작이고, Turbo 여부는 script가 결정합니다.

## 시각화

```text
pnpm --filter <pkg> <script>
  -> <pkg>/package.json 의 scripts.<script> 실행

scripts.build = "next build"   -> turbo X
scripts.build = "turbo build"  -> turbo O
```

## 이중 연결

### 프로젝트 내부

- 루트/앱 script 정의가 다르기 때문에 같은 `build`여도 경로가 달라집니다.  
  ([package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7, [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9)

### 학습 토픽

- 캐시/빌드 관점은 [docs/study/cache/README.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/study/cache/README.md):14와 직접 연결됩니다.

Q3 반영해 세션 상태도 갱신했습니다: [.study/learn/session-state.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.study/learn/session-state.md):1

## Q4. 그러면 A/B 비교 테스트는: 루트에서 turbo를 이용한 build 3번 -> --filter를 이용해 next 직접 빌드 3번 / 비교 맞을까요?

## 패턴 매핑

네, 방향은 맞습니다.  
지금은 `Counterfactual A/B` 실험(터보 경로 vs 터보 우회 경로)으로 판단하면 됩니다.

## 코드 추적

- Turbo 경로: 루트 `build`가 `turbo build`입니다.  
  [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7
- 우회 경로: `@joseph0926/blog`의 `build`는 `next build`입니다.  
  [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9

즉,

- A: `./node_modules/.bin/turbo run build --filter=@joseph0926/blog --summarize`
- B: `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog build`

## 시각화

```text
권장 측정
1) Cold (캐시 영향 최소화): A 5회 vs B 5회
2) Warm (실사용 체감): A 5회 vs B 5회
3) 각 그룹 중앙값 비교
4) 절감률 = (B중앙값 - A중앙값) / B중앙값 * 100
```

`3회`도 가능하지만 노이즈가 커서 `5회+중앙값`이 더 안정적입니다.

## 이중 연결

- 프로젝트 내부: 루트 스크립트와 앱 스크립트가 달라 A/B 분리가 가능합니다.  
  [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7, [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9
- 세션 기록 갱신: [session-state.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.study/learn/session-state.md):1

원하면 다음 메시지에서 제가 바로 실행 가능한 벤치마크 스크립트(자동 반복/중앙값 계산)까지 짧게 작성해드리겠습니다.

## Q5. 네 진행해주세요

이번에는 실제 A/B 벤치마크를 실행해서 수치로 비교하겠습니다.  
진행 계획:

1. `turbo build`와 `pnpm --filter ... build`가 현재 환경에서 모두 성공하는지 1회 스모크 실행
2. `cold`(캐시 제거 후) 3회씩 측정
3. `warm`(캐시 유지) 3회씩 측정
4. 각 그룹 중앙값/평균/절감률 계산
5. 결과를 표로 정리하고 20% 기준 충족 여부 판단

리스크/엣지케이스:

- 빌드 시 필수 env 누락으로 실패할 수 있음
- 측정 노이즈가 커서 3회 결과는 방향성 위주로 해석 필요

검증 명령:

- `./node_modules/.bin/turbo run build --filter=@joseph0926/blog --summarize`
- `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog build`

## Q6. 즉 캐시가 있으면 turbo가 90% 빠르다 로 이해하면될까요?

네, **이번 측정 조건에서는 그렇게 이해하셔도 됩니다.**

정확히는:

- 대상: `build`
- 조건: `warm`(캐시가 이미 채워진 재실행)
- 결과: 중앙값 기준 `11.98s -> 1.19s`로 약 **90.07% 단축**

다만 이 수치를 전체 작업(예: lint/test/dev)에 그대로 일반화하면 안 되고, **캐시 히트율이 높은 작업에서 특히 크게 이득**이 난다고 보시면 됩니다.

## Q7. 그러면 이미 turbo로 구성된 상황에서 굳이 돌아갈 필요는 없다보이는데 맞을까요?

## 패턴 매핑

네, 현재는 **“유지가 기본, 문제 생기면 축소”**가 맞습니다.

## 코드 추적

- warm build에서 Turbo가 큰 이점: `11.98s -> 1.19s` (약 `+90.07%`)  
  (측정 CSV: [/tmp/turbo_ab_benchmark_20260303.csv](/tmp/turbo_ab_benchmark_20260303.csv))
- cold build에서는 Turbo가 불리: `11.61s -> 12.72s` (약 `-9.56%`)
- 루트 빌드 경로 자체가 Turbo 전제: [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7

추론: 지금 되돌리면 warm 이점을 포기하는 비용이 더 큽니다.

## 시각화

```text
warm 비중 높음 -> Turbo 유지
cold-only 환경 지속 -> Turbo 범위 축소/재검토
```

## 이중 연결

- 프로젝트 내부: 루트 빌드 오케스트레이션이 Turbo 중심입니다.
- 학습 연결: Build/CI 캐시 판단 프레임과 동일합니다. [docs/study/cache/README.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/study/cache/README.md):14

세션 상태 Q7까지 반영했습니다: [.study/learn/session-state.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.study/learn/session-state.md):1

## Q8. 이번 과정에서 제가 배운건 단순히 turbo를 쓰면 캐시있으면 더빠름이 아니라 / 뭔가 결정할때는 A/B 테스트를 통해 확실히해라로 잡으면될까요? 아니면 더 배울점이있을까요?

네, 핵심을 아주 정확히 잡으셨습니다.  
그리고 추가로 이 3개까지 가져가시면 더 좋습니다.

## 패턴 매핑

핵심 프레임: **가설 -> A/B 측정 -> 해석 -> 운영 가드레일**

## 코드 추적

- 이번에 실제로 `cold/warm`을 분리해서 봤고, 결론이 달랐습니다.  
  `warm`: Turbo 유리, `cold`: Turbo 불리  
  근거: [/tmp/turbo_ab_benchmark_20260303.csv](/tmp/turbo_ab_benchmark_20260303.csv)
- 즉 “빠르다/느리다”가 아니라 **조건별로 다르다**를 확인한 게 핵심 학습입니다.

## 시각화

```text
기술 선택 질문
-> 어떤 조건에서 쓰나? (cold/warm)
-> A/B 측정했나?
-> 결과를 어디까지 일반화할 수 있나?
-> 유지한다면 모니터링 지표는 뭔가?
```

## 이중 연결

- 프로젝트 내부: 루트는 Turbo 오케스트레이션, 앱은 직접 빌드 경로가 공존해서 A/B가 가능했습니다.  
  [package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/package.json):7  
  [apps/blog/package.json](/Users/kimyounghoon/Downloads/@kyh/joseph0926/apps/blog/package.json):9
- 학습 토픽: Build/CI 캐시 판단 프레임과 직접 연결됩니다.  
  [docs/study/cache/README.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/docs/study/cache/README.md):14

세션 Q8까지 반영했습니다: [.study/learn/session-state.md](/Users/kimyounghoon/Downloads/@kyh/joseph0926/.study/learn/session-state.md):1

## 연결

### 프로젝트 내부

| 모듈/파일                                             | 관계                     | 근거                                                                          |
| ----------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| `package.json` ↔ `turbo.json`                         | 루트 실행 오케스트레이션 | 루트 `build/type-check/dev`가 turbo task를 호출하고 task 의존 그래프를 사용함 |
| `apps/blog/package.json` ↔ `packages/ui/package.json` | 앱-공유 UI 패키지 의존   | `@joseph0926/ui`를 workspace 의존으로 사용하고 app에서 다수 import함          |
| `.github/workflows/ci.yml` ↔ 루트 스크립트            | CI 실행 전략             | lint/type-check는 앱 필터, build는 루트 실행으로 모노레포 경로를 함께 사용함  |

### 학습 토픽

| 대상 토픽                    | 관계                         | 근거                                                                   |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `docs/study/cache/README.md` | 빌드/CI 캐시 의사결정 프레임 | Turborepo를 Build/CI 캐시 레이어로 다루며 캐시 미스 진단 기준을 제공함 |
