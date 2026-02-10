# 14. 퀴즈 복습 노트 3차

[← 목차로 돌아가기](./README.md) | [← 이전: Tree-shaking 대화 복습 로그](./13-tree-shaking-qna.md)

---

## 퀴즈 결과 요약

- **일시**: 2026-02-10
- **범위**: 01-basics ~ 13-tree-shaking-qna (기록 문서 전체)
- **목적**: Tree-shaking 보강 후 종합 점검 (Q1~Q10 완주)
- **응시**: Q1~Q10
- **점수**: 8.35 / 10 (83.5%)

### 2차 → 3차 비교

| 항목           | 2차 (02-07)  | 3차 (02-10)              |
| -------------- | ------------ | ------------------------ |
| 점수           | 3.55/6 (59%) | 8.35/10 (83.5%)          |
| 출제 범위      | Q1~Q6        | Q1~Q10                   |
| Tree-shaking   | 미포함       | ✅ sideEffects/mark 반영 |
| 순환 참조(CJS) | 미응시       | ✅ partial exports 설명  |

---

## Round 1: 기초 (Q1~Q4)

### Q1. ESM ↔ CJS 상호 운용 — ⚠️ 부분 정답 (0.70)

**내 답변 요지**

- ESM에서 CJS import 가능
- CJS에서 ESM require 불가능
- 우회 방법은 모름

**보완 포인트**

- CJS에서 ESM 우회: `await import('esm-pkg')`

```javascript
// CJS에서 ESM 모듈 로드
const esmModule = await import('esm-pkg');
```

---

### Q2. ESM 정적 분석 가능 이유 — ✅ 정답 (1.00)

**내 답변 요지**

- import는 파일 최상단
- export는 조건문에 넣을 수 없음
- 빌드 타임 그래프 완성 (동적 import 확장 제외)

**평가**

- import/export 양쪽 정적 조건을 모두 설명함

---

### Q3. `process.cwd()` vs `__dirname` — ⚠️ 부분 정답 (0.60)

**내 답변 요지**

- 둘 다 절대 경로
- cwd는 실행 위치 기준, `__dirname`은 파일 위치 기준

**보완 포인트**

- `__dirname`은 **파일 경로가 아니라 디렉터리 경로**
- 예: `some.js`가 `/project/some.js`면 `__dirname`은 `/project`

---

### Q4. `import.meta` 확장 지점 — ⚠️ 부분 정답 (0.80)

**내 답변 요지**

- `import.meta`는 확장 출입문 역할
- Node/Vite가 속성을 채움
- 예: `import.meta.dirname`, `import.meta.env.VITE_*`

**보완 포인트**

- "빈 객체"보다는 "스펙이 틀을 정의하고 호스트가 채우는 메타데이터 객체"로 표현하는 것이 정확함

---

## Round 2: 중급 (Q5~Q8)

### Q5. ESM 로딩 3단계 C-I-E — ⚠️ 부분 정답 (0.75)

**내 답변 요지**

- Construction: 그래프 구축
- Instantiation: 연결
- Evaluation: 실행

**보완 포인트**

- 장벽 위치를 명시해야 완전 정답:
  - `Instantiation` 이후, `Evaluation` 이전
- Evaluation 실행 순서:
  - 의존성 순서 (`leaf -> root`)

---

### Q6. CJS Top-level await 불가 이유 — ✅ 정답 (1.00)

**내 답변 요지**

- CJS 모듈은 동기 래퍼
- `module.exports`를 즉시 반환해야 해서 await 구조적으로 불가

**평가**

- `require()`의 동기/즉시 반환 제약을 정확히 설명함

---

### Q7. CJS Value Copy 코드 설명 — ⚠️ 부분 정답 (0.85)

**내 답변 요지**

- `increment`는 원본 `count`를 바꾸고, 복사본 `count`는 안 바뀜

**보완 포인트**

- 출력값까지 명시 필요: `0`, `0`
- 표현 정밀화:
  - `increment`가 클로저로 원본 변수 `count`를 변경

---

### Q8. CJS 순환 참조의 partial exports — ⚠️ 부분 정답 (0.80)

**내 답변 요지**

- CJS는 동기/상단부터 실행
- 실행 중간 `require`가 끼면 아직 준비 안 된 값이 `undefined`

**보완 포인트**

- 핵심 용어 추가:
  - **partial exports(불완전한 exports 객체)**
- "항상 undefined"가 아니라:
  - **아직 할당되지 않은 프로퍼티만** `undefined`

---

## Round 3: 심화 (Q9~Q10)

### Q9. `sideEffects: false` 의미와 위험 — ✅ 정답 (0.95)

**내 답변 요지**

- "부작용 없으니 제거해도 된다"는 선언
- 사람 판단이라 오판 위험 존재

**보완 포인트**

- 오판 시 전역 초기화/폴리필 제거로 런타임 에러 가능

---

### Q10. ModalProvider 중앙 registry 번들 비대화 — ✅ 정답 (0.90)

**내 답변 요지**

- 정적 import된 모든 modal 모듈이 그래프에 포함
- 전체 로드되어 번들 증가
- lazy 로딩 필요

**보완 포인트**

- 빌드 타임에는 런타임 상태 분기(zustand type 값)를 확정하기 어려워 제거가 제한됨
- 개선: `type -> () => import('./ModalX')`

---

## 최종 요약

- 총점: **8.35 / 10**
- 강점:
  - 정적 분석/Tree-shaking 핵심 개념 설명력 향상
  - CJS Top-level await 불가 이유를 구조적으로 설명 가능
  - 실무 사례(ModalProvider 번들 비대화)와 이론 연결 가능
- 보강 필요:
  - `__dirname`은 디렉터리 경로라는 점 고정
  - C-I-E에서 장벽 위치 + `leaf -> root` 실행 순서 즉답화
  - CJS에서 ESM 우회(`await import`) 자동 회상

---

## 다음 학습 액션

- [ ] `__dirname`/`__filename`/`cwd`를 실행 위치별 표로 1회 재작성
- [ ] C-I-E + 장벽 + leaf→root를 3줄 요약으로 3회 반복
- [ ] CJS↔ESM 상호 운용 답변 템플릿 암기 (`require` 불가 + `await import` 우회)

---

_작성일: 2026-02-10_
