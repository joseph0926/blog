# 2. 심화 개념

[← 목차로 돌아가기](./README.md) | [← 이전: 기본 개념](./01-basics.md)

---

## Live Binding vs Value Copy (중요)

ESM과 CJS의 가장 중요한 차이 중 하나입니다.

### ESM: Live Binding

```javascript
// counter.js
export let count = 0;
export function increment() {
  count++;
}

// main.js (ESM)
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1 ← 원본이 바뀜 (live binding)
```

### CJS: Value Copy

```javascript
// counter.js (CJS)
let count = 0;
module.exports = { count, increment: () => count++ };

// main.js
const { count, increment } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // 0 ← 복사된 값 (value copy)
```

**핵심**: ESM은 "참조"를 export하고, CJS는 "값"을 export합니다.

---

## 순환 참조 처리 차이

```javascript
// a.js
import { b } from './b.js';
export const a = 'A' + b;

// b.js
import { a } from './a.js';
export const b = 'B' + a;
```

|        | CJS                | ESM                     |
| ------ | ------------------ | ----------------------- |
| 동작   | 불완전한 객체 반환 | TDZ 에러 또는 undefined |
| 디버깅 | 어려움             | 에러로 빨리 발견        |

---

## Dynamic Import (둘 다 가능)

조건부 로딩이 필요할 때 사용합니다.

```javascript
// ESM, CJS 모두 가능
const module = await import('./heavy.js');
```

---

## Dual Package (라이브러리 배포 시)

ESM과 CJS 사용자 모두를 지원하려면:

```json
// package.json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## 학습 우선순위

| 순위 | 개념                       | 이유                   |
| ---- | -------------------------- | ---------------------- |
| 1    | Live binding vs Value copy | 버그 원인이 될 수 있음 |
| 2    | Dynamic import             | 코드 스플리팅에 필수   |
| 3    | 순환 참조                  | 디버깅 시 알아야 함    |
| 4    | Dual package               | 라이브러리 배포 시     |

---

[다음: 모듈 로딩 →](./03-loading.md)
