# 8. 추가 학습 TODO

[← 목차로 돌아가기](./README.md) | [← 이전: 체크리스트](./07-checklist.md)

---

> 아직 다루지 않은 ESM/CJS 관련 주제들입니다. 학습 후 체크하세요.

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

| 순위 | 주제                        | 이유                      |
| ---- | --------------------------- | ------------------------- |
| 1    | CJS → ESM 마이그레이션 전략 | 실무에서 가장 자주 마주침 |
| 2    | ERR_REQUIRE_ESM 해결        | 자주 발생하는 에러        |
| 3    | TypeScript + ESM 설정       | 현대 프로젝트 필수        |
| 4    | Dual Package 작성           | 라이브러리 배포 시 필요   |
| 5    | Tree-shaking 실전           | 번들 크기 최적화          |

---

_작성일: 2026-02-03_
