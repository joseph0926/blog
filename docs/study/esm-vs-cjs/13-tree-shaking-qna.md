# 13. Tree-shaking 대화 복습 로그

[← 목차로 돌아가기](./README.md) | [← 이전: ESM 로딩 3단계 대화 복습 로그](./12-construction-instantiation-qna.md)

---

> 목적: Tree-shaking 관련 Q&A 흐름을 그대로 문서화하고, 실무에서 번들 크기가 커지는 원인을 연결해 복습

---

## 대화 흐름 (질문 → 답변 → 이해 확인)

### 1) "미사용인데 side effect가 있을 수 있나?"

**질문**

> 미사용인데, 사이드 이펙트가 있을 수 있는 경우가 있나요? 전역적으로 사용되는 경우 같은 걸 말하는 걸까요?

**답변 요지**

- 가능함
- `미사용`은 "export를 안 씀"이고, `side effect`는 "export 사용 여부와 무관하게 로드 시 실행되는 동작"
- 전역 수정/초기화가 대표 사례

```ts
// polyfill.ts
Array.prototype.sum = function () {
  return this.reduce((a, b) => a + b, 0);
};
window.appReady = true;
```

**복습 포인트**

- "미사용 export"와 "모듈 로드시 실행 필요"는 별개 기준

---

### 2) "그럼 import된 모듈은 트리쉐이킹 안 하면 되지 않나?"

**질문**

> import 된 모듈도 트리쉐이킹 안 하면 되는 거 아닌가요?

**답변 요지**

- `import`됐다는 이유만으로 모듈 전체를 보존하면 tree-shaking 이점이 사라짐
- 기준은 "import 여부"가 아니라 "실행에 꼭 필요한 코드인가"
- `import { a }`에서 `a`만 쓰면 나머지 export는 제거 가능
- `import './setup'`처럼 side-effect import는 제거하면 안 됨

**복습 포인트**

- tree-shaking은 "필요 코드 유지 + 불필요 코드 제거"의 균형

---

### 3) "a만 쓰는데 lib에 전역 코드가 있으면 버그 날 수 있나?"

**질문**

> `import { a } from './lib'`에서 a만 남기고 tree-shaking했는데, lib에 전역 동작 코드가 있으면 의도와 다르게 동작 안 할 수도 있나요?

**답변 요지**

- 가능함
- 다만 번들러는 원래 side effect를 보수적으로 남기려 함
- 버그는 보통 "부작용 없음"으로 잘못 표시할 때 발생

**대표 원인**

- `package.json`의 `"sideEffects": false`를 잘못 선언
- 잘못된 pure 주석(`/*#__PURE__*/`) 남용
- 순수 유틸 코드와 전역 초기화 코드를 같은 파일에 혼합

---

### 4) "간단 코드 예시로 보여달라"

```ts
// src/polyfill.ts (전역 부작용)
(Array.prototype as any).sum = function () {
  return this.reduce((a: number, b: number) => a + b, 0);
};

// src/lib.ts
import './polyfill';
export const a = 1;

// src/main.ts
import { a } from './lib';
console.log(a);
console.log(([1, 2, 3] as any).sum()); // 6 기대
```

```json
// package.json (문제 설정)
{
  "sideEffects": false
}
```

**답변 요지**

- 위처럼 잘못 선언하면 `polyfill`이 제거되어 런타임에서 `sum is not a function`가 날 수 있음

**복습 포인트**

- 전역 초기화 파일은 명시적으로 보호해야 함
- 예: `"sideEffects": ["./src/polyfill.ts", "*.css"]`

---

### 5) "sideEffects false를 아예 안 쓰면?"

**질문**

> 그러면 sideEffects를 false로 무조건 안 쓰면 해결되지 않나요?

**답변 요지**

- 안정성은 올라가지만 최적화 손해가 생길 수 있음
- 모듈 단위 제거 효율이 떨어져 번들 크기가 커질 수 있음

**실무 권장**

1. 확신 없으면 일단 `false` 미사용
2. side-effect 파일을 분리
3. 파일 패턴 기반으로 정확히 선언

---

### 6) "사람 대신 도구가 자동으로 판단할 수 없나?"

**질문**

> 사람이 sideEffects true/false를 판단하지 않고 도구로 자동 판단할 수는 없나요?

**답변 요지**

- 완전 자동 판정은 어려움
- 도구는 후보를 추정하고, 최종 확정은 사람이 해야 안전함

**실무 흐름**

1. 정적 분석으로 위험 패턴 탐지 (top-level 호출/전역 변경 등)
2. 번들 결과 확인 (실제 제거/잔존 모듈 체크)
3. `sideEffects` 명시
4. CI 스모크 테스트로 회귀 방지

---

### 7) "\"사용 심볼 마킹(Mark)\"은 어떻게 하나?"

**질문**

> "사용 심볼 마킹 (Mark)"는 어떤 식으로 이루어지나요?

**답변 요지**

- 그래프 탐색으로 처리
- 엔트리와 side-effect import를 시작점(root)으로 잡고 참조를 따라 `used/included` 표시
- 표시되지 않은 심볼은 제거 후보

```text
1) import/export 파싱 -> 심볼 그래프 생성
2) root 심볼 mark
3) 참조 심볼을 worklist로 전파 mark
4) unmarked + side effect 없음 -> 제거 후보
```

---

### 8) "마킹을 진짜 내부적으로 하나?"

**질문**

> 마킹이라는 게 진짜 코드적으로 마킹하고 나중에 지우는 건가요?

**답변 요지**

- 개념적으로 맞음
- 번들러는 AST/심볼에 내부 플래그(`used`, `included`)를 두고 출력 단계에서 미포함 처리
- 원본 파일을 직접 지우기보다 "출력할 코드만 선택"하는 방식

---

### 9) "minifier는 뭔가?"

**질문**

> "미사용 export/문장을 삭제하고, minifier가 추가로 정리합니다." 여기서 minifier는 뭔가요?

**답변 요지**

- 번들 결과 JS를 더 작게 만드는 도구
- 공백/주석 제거, 변수명 축약, 상수 폴딩, dead code 정리

**대표 도구**

- `terser`
- `esbuild minify`
- `swc minify`

---

### 10) "barrel file이 tree-shaking을 방해하는 이유?"

**질문**

> `export * from "./lib"`이면 lib에서 뭘 쓰는지 명시가 약해서 그런 건가요?

**답변 요지**

- 핵심 방향은 맞음
- `export *`는 실제 공개 심볼 확정을 늦추고 분석을 복잡하게 만듦
- 체인 중 side effect/CJS 혼용/namespace import가 섞이면 보수적으로 남기기 쉬움

**복습 포인트**

- 가능하면 `export { A, B } from './lib'` 같은 명시 re-export 선호

---

### 11) "re-export는 왜 하나?"

**질문**

> re-export는 왜 하는 건가요?

**답변 요지**

- 공개 API를 한 곳에서 관리하려고 사용
- import 경로 단순화, 내부 구조 은닉, 공개 범위 통제, 마이그레이션 용이

```ts
// src/index.ts
export { Button } from './ui/Button';
export { Modal } from './ui/Modal';
```

---

### 12) "ModalProvider + zustand에서 모든 모달이 번들에 포함된 경험"

**질문**

> ModalProvider로 중앙 관리했는데 빌드 시 모든 Modal 컴포넌트가 포함되어 번들이 커졌습니다. 지금 상황과 일치하나요?

**답변 요지**

- 일치함
- Provider가 모든 Modal을 정적 import한 registry를 가지면 번들러는 전부 포함
- 어떤 modal이 열릴지는 런타임 상태(zustand)라 빌드 타임에 제거 판단이 어려움

**개선 방향**

```ts
const modalRegistry = {
  alert: () => import('./AlertModal'),
  confirm: () => import('./ConfirmModal'),
} as const;
```

- 동적 import + code splitting으로 "열릴 때 로드" 전략 적용

---

## 최종 한 줄

Tree-shaking은 "안 쓰는 export 제거"만이 아니라, side effect 안전성과 런타임 분기까지 함께 고려하는 보수적 최적화이며, 중앙 registry 패턴에서는 동적 import 설계가 번들 크기 최적화의 핵심이다.

---

_작성일: 2026-02-09_  
_업데이트: 2026-02-09 (Tree-shaking Q&A 대화 내용 문서화)_
