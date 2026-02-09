# 8. 추가 학습 TODO

[← 목차로 돌아가기](./README.md) | [← 이전: 체크리스트](./07-checklist.md)

---

> 아직 다루지 않은 ESM/CJS 관련 주제들입니다. 학습 후 체크하세요.

---

## 블로그 글 작성 전 보강 필수 (퀴즈 리뷰 기반)

> 2026-02-05 리뷰 결과. 기존 정리에서 "안다" 수준을 "설명할 수 있다" 수준으로 올려야 하는 항목.

### 1순위: Value Copy vs Live Binding 메커니즘 (Q4 취약)

- [x] CJS에서 `module.exports = { count }` 시 **객체 리터럴 평가 시점에 값이 복사되는 과정** 정리 → [10-value-copy-vs-live-binding.md](./10-value-copy-vs-live-binding.md)
- [x] ESM에서 `export let count`가 참조를 내보내는 원리: **Module Environment Record 바인딩** 설명 → [10-value-copy-vs-live-binding.md](./10-value-copy-vs-live-binding.md)
- [ ] CJS에서도 참조처럼 동작시키는 우회 패턴 (`Object.defineProperty`, `exports.count` 직접 접근)
- [ ] "CJS도 우회 가능하지만 ESM은 언어 레벨에서 보장" 결론 도출

### 2순위: ESM 로딩 3단계 — "왜 이렇게 나눴는지" (Q5 부분 정답)

- [x] C-I-E 단계 역할 구분 + 장벽 위치 설명 정리 → [12-construction-instantiation-qna.md](./12-construction-instantiation-qna.md)
- [x] Construction(모듈 그래프) vs Instantiation(바인딩 연결) 구분 정리 → [12-construction-instantiation-qna.md](./12-construction-instantiation-qna.md)
- [x] **Construction**: 모듈 그래프 완성이 Instantiation의 전제 조건인 이유 → [12-construction-instantiation-qna.md](./12-construction-instantiation-qna.md)
- [x] **Instantiation**: 메모리 할당만 하고 값을 넣지 않는 이유 → 순환 참조 시 TDZ로 빠르게 에러 발견 → [12-construction-instantiation-qna.md](./12-construction-instantiation-qna.md)
- [x] **Evaluation**: leaf부터 실행하는 이유 → 의존성 없는 것부터 값을 채워야 하므로 → [12-construction-instantiation-qna.md](./12-construction-instantiation-qna.md)
- [ ] 번들러 글(2025-12-20)과 연결: "의존성 그래프 구축 → ESM 3단계 Construction"

### 3순위: Tree-shaking 동작 원리 (번들러 글 예고 주제)

- [ ] 정적 분석 → 사용하지 않는 export 탐지 → dead code elimination 과정
- [ ] `import { a } from 'lib'`에서 `b`를 안 쓰면 번들러가 제거하는 흐름
- [ ] **side effects**: `"sideEffects": false` 설정의 의미
- [ ] barrel file(`index.ts`)이 tree-shaking을 방해하는 이유

### 4순위: 순환 참조 실제 동작 (02-advanced 보강)

- [ ] CJS "불완전한 객체"의 구체적 상태: 아직 실행 안 된 부분이 `undefined`인 이유
- [x] ESM 순환 참조: Instantiation에서 바인딩 생성 → 값 없이 접근 시 TDZ → CJS보다 나은 이유 → [12-construction-instantiation-qna.md](./12-construction-instantiation-qna.md)
- [ ] 실무에서 순환 참조를 유발하는 패턴 (barrel file re-export 등)

### 5순위: Dual Package / exports 심화 (Q9 미학습, 선택)

- [ ] `exports` 필드 우선순위: Node.js가 `exports` > `main` > `module` 순으로 해석
- [ ] subpath exports: `"./utils": { "import": "...", "require": "..." }` 패턴
- [ ] **Dual Package Hazard**: 같은 패키지가 ESM/CJS 두 번 로드되면 `instanceof` 깨지는 문제
- [ ] TypeScript `moduleResolution: "bundler"` vs `"node16"`이 `exports` 해석에 미치는 영향

---

## 실무 적용

- [ ] **Dual Package 작성**: 라이브러리 배포 시 ESM/CJS 모두 지원하는 `package.json` exports 설정
- [ ] **조건부 exports**: `package.json`의 `exports` 필드 심화 (subpath exports, conditional exports)
- [ ] **번들러 설정**: Vite/Webpack/Rollup에서 ESM/CJS 혼용 처리 방법
- [ ] **TypeScript + ESM**: `moduleResolution: "bundler"` vs `"node16"` 차이

---

## 런타임 & 환경

- [ ] **Node.js ESM 지원 역사**: Node 12/14/16/18/20 버전별 ESM 지원 변화
- [ ] **Deno/Bun ESM**: Node.js 외 런타임에서의 ESM 동작 차이
- [ ] **브라우저 ESM**: `<script type="module">`, import maps, bare specifier 해결
- [ ] **Edge Runtime**: Cloudflare Workers, Vercel Edge에서의 모듈 시스템

---

## 심화 개념

- [ ] **Module Resolution Algorithm**: Node.js가 import 경로를 해석하는 전체 알고리즘
- [ ] **Module Namespace Object**: `import * as ns from 'module'`의 동작 원리
- [ ] **Synthetic Default Export**: CJS 모듈을 ESM에서 default import할 때의 처리
- [ ] **JSON Modules**: `import data from './data.json' with { type: 'json' }`
- [ ] **WASM Modules**: WebAssembly 모듈 import 방법

---

## 마이그레이션

- [ ] **CJS → ESM 마이그레이션 전략**: 대규모 프로젝트 전환 단계별 접근법
- [ ] **호환성 레이어**: `createRequire`로 ESM에서 CJS 모듈 사용하기
- [ ] **ESM-only 패키지 대응**: `chalk`, `ora` 같은 ESM-only 패키지를 CJS 프로젝트에서 사용

---

## 도구 & 생태계

- [ ] **tsx/ts-node ESM 모드**: TypeScript + ESM 개발 환경 설정
- [ ] **Jest + ESM**: Jest에서 ESM 테스트 환경 구성
- [ ] **ESLint + ESM**: `eslint.config.js` (Flat Config) ESM 설정
- [ ] **package.json `type` 필드**: 파일 단위 `.mjs`/`.cjs` vs 프로젝트 단위 `type` 설정 전략

---

## 디버깅 & 트러블슈팅

- [ ] **ERR_REQUIRE_ESM**: CJS에서 ESM 패키지 require 시 에러 해결
- [ ] **ERR_MODULE_NOT_FOUND**: ESM에서 확장자 누락 에러 해결
- [ ] **ERR_UNKNOWN_FILE_EXTENSION**: `.ts` 파일 직접 실행 시 에러 해결
- [ ] **순환 참조 디버깅**: 실제 순환 참조 발생 시 디버깅 방법

---

## 성능 & 최적화

- [ ] **Tree-shaking 실전**: 번들러에서 실제로 dead code가 제거되는지 확인 방법
- [ ] **Dynamic Import 패턴**: 코드 스플리팅, lazy loading 실전 패턴
- [ ] **Barrel Files 문제**: `index.ts`로 re-export 시 tree-shaking 저해 문제

---

## 학습 우선순위 제안

### 블로그 글 작성용 (보강 필수)

| 순위 | 주제                                | 이유                                  | 상태                                                        |
| ---- | ----------------------------------- | ------------------------------------- | ----------------------------------------------------------- |
| 1    | Value Copy vs Live Binding 메커니즘 | 퀴즈 취약 + 블로그 핵심 차별화 포인트 | ✅ 완료 ([10번](./10-value-copy-vs-live-binding.md))        |
| 2    | ESM 3단계 "왜 이렇게 나눴는지"      | 번들러 글 후속 연결                   | 🟡 진행 중 ([12번](./12-construction-instantiation-qna.md)) |
| 3    | Tree-shaking 동작 원리              | 번들러 글에서 예고한 주제             | 📚 새로 정리                                                |
| 4    | 순환 참조 실제 동작                 | CJS vs ESM 비교 완성도                | 🟡 진행 중 ([12번](./12-construction-instantiation-qna.md)) |
| 5    | Dual Package / exports 심화         | 실무 적용 섹션용 (선택)               | 📚 새로 정리                                                |

### 일반 학습용

| 순위 | 주제                        | 이유                      |
| ---- | --------------------------- | ------------------------- |
| 1    | CJS → ESM 마이그레이션 전략 | 실무에서 가장 자주 마주침 |
| 2    | ERR_REQUIRE_ESM 해결        | 자주 발생하는 에러        |
| 3    | TypeScript + ESM 설정       | 현대 프로젝트 필수        |
| 4    | Dual Package 작성           | 라이브러리 배포 시 필요   |
| 5    | Tree-shaking 실전           | 번들 크기 최적화          |

---

_작성일: 2026-02-03_
_업데이트: 2026-02-09 (추가 대화 반영: 2순위/4순위 일부 완료 체크)_
