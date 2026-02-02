# Node.js 모듈 시스템: ESM vs CJS

> Node.js 환경에서 ES Modules(ESM)과 CommonJS(CJS)의 차이를 Q&A 형식으로 정리한 문서입니다.

---

## 1. 기본 개념

### ESM vs CJS 핵심 차이

| 항목                         | CommonJS (CJS)                | ES Modules (ESM)               |
| ---------------------------- | ----------------------------- | ------------------------------ |
| **문법**                     | `require()`, `module.exports` | `import`, `export`             |
| **로딩**                     | 동기(synchronous)             | 비동기(asynchronous)           |
| **파싱**                     | 런타임에 평가                 | 정적 분석 가능 (빌드 타임)     |
| **파일 확장자**              | `.js`, `.cjs`                 | `.mjs` 또는 `"type": "module"` |
| **Top-level await**          | 불가                          | 가능                           |
| **`__dirname`/`__filename`** | 기본 제공                     | 직접 구현 필요                 |
| **Tree-shaking**             | 어려움                        | 가능 (정적 분석)               |

### 문법 비교

```javascript
// CJS
const fs = require('fs');
module.exports = { foo: 'bar' };

// ESM
import fs from 'fs';
export const foo = 'bar';
```

### `__dirname` ESM에서 사용하기

```typescript
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### package.json 설정

```json
// CJS (기본)
{ "type": "commonjs" }

// ESM
{ "type": "module" }
```

### 상호 운용

| 방향                | 가능 여부                                             |
| ------------------- | ----------------------------------------------------- |
| ESM에서 CJS import  | 가능 (`import x from 'cjs-pkg'`)                      |
| CJS에서 ESM require | 불가 (dynamic import 필요: `await import('esm-pkg')`) |

---

## 2. Q&A: 정적 분석과 비동기 로딩

### Q: 비동기적으로 로드되는데 정적 분석이 가능한 게 잘 매칭이 안 됩니다. 비동기는 필요할 때 부르고 기다리는 거와 상관없이 다른 작업 수행 가능이라는 느낌인데, 정적 분석이 가능하다는 건 이미 다 로드된 거 아닌가요?

### A: 두 개념은 **다른 시점**을 말합니다.

| 시점       | 정적 분석                       | 비동기 로딩               |
| ---------- | ------------------------------- | ------------------------- |
| **언제**   | 파싱 타임 (코드 실행 전)        | 런타임 (실제 실행 시)     |
| **무엇을** | "어떤 모듈을 import하는지" 파악 | 모듈 파일을 실제로 가져옴 |

**정적 분석이 가능한 이유**: ESM의 `import`는 **파일 최상단에만** 올 수 있고, 조건문 안에 넣을 수 없습니다:

```javascript
// ESM - 정적 분석 가능
import { foo } from './module.js'; // 항상 최상단

// CJS - 정적 분석 불가
if (condition) {
  const foo = require('./module.js'); // 런타임에 결정됨
}
```

번들러(Vite, Webpack)가 **코드 텍스트만 읽어도** ESM의 의존성 그래프를 100% 알 수 있습니다. 코드를 실행할 필요가 없습니다.

**비동기 로딩이란**: "비동기"는 **모듈 파일을 가져오는 I/O**가 비동기라는 뜻입니다:

```javascript
// Node.js 내부 동작 (개념적)

// CJS: 동기 블로킹
const fs = require('fs'); // 여기서 멈추고 파일 다 읽을 때까지 대기

// ESM: 비동기
import fs from 'fs'; // 파일 로딩이 비동기, 하지만 모듈 평가 전에 완료됨
```

**핵심 정리**:

```
[빌드 타임]
   ↓
코드 파싱 → "import 문 발견" → 의존성 그래프 구축 (정적 분석)
   ↓
[런타임]
   ↓
모듈 파일 로드 (비동기 I/O) → 모든 의존성 준비 → 코드 실행
```

- **정적 분석**: "뭘 import할지"는 코드 보면 안다 (실행 없이)
- **비동기 로딩**: "실제로 가져오는 작업"은 논블로킹으로 수행

---

## 3. Q&A: CJS에서 정적 분석

### Q: 그러면 `require()`도 조건문 안에 안 쓴다는 규칙을 강제하면 정적 분석이 가능한가요?

### A: 이론적으로는 **부분적으로 맞습니다**. 하지만 완벽하지 않은 이유가 있습니다.

**1. 문법적 강제 vs 린트 규칙**

|               | ESM                     | CJS                   |
| ------------- | ----------------------- | --------------------- |
| **강제 수준** | 언어 문법 (파서가 거부) | 린트 규칙 (우회 가능) |

```javascript
// ESM - 문법 에러
if (x) {
  import y from 'z'; // SyntaxError: 파서가 거부
}

// CJS - 유효한 코드
if (x) {
  require('z'); // 린트가 경고해도 실행됨
}
```

**2. export 쪽 문제**

`require()` 위치를 제한해도, **export 방식**은 여전히 동적입니다:

```javascript
// CJS - 런타임에 결정
module.exports = condition ? { a } : { b };
module.exports = createExports(); // 함수 호출 결과

// ESM - 정적으로 고정
export { a, b }; // 파서가 바로 알 수 있음
```

Tree-shaking은 "import 하는 쪽"과 "export 하는 쪽" 둘 다 정적이어야 합니다.

**결론**: "규칙을 강제하면" 어느 정도 가능하지만, 완벽하지는 않습니다. ESM은 **언어 설계 단계**에서 정적 분석을 고려해서 만들어진 것이고, CJS에 규칙을 덧씌우는 것과는 근본적으로 다릅니다.

---

## 4. Q&A: 모듈 로딩과 실행 순서

### Q: 모든 import가 resolve될 때까지 기다린 후 << 이 말은 import를 읽는 순서는 비동기적으로 읽지만, import 전체적으로 볼 때는 동기적이라는 뜻인가요?

### A: 네, 거의 정확합니다.

**ESM 로딩 3단계**:

```
1. Construction (파싱)     ─┐
   - import 문 발견        │ 병렬/비동기로 파일 fetch
   - 모듈 그래프 구축      ─┘
          ↓
2. Instantiation (연결)
   - export/import 바인딩
          ↓
    ══════════════════════  ← 여기가 "장벽" (모든 모듈 준비 완료)
          ↓
3. Evaluation (실행)
   - 코드 실행 (의존성 순서대로)
```

**비동기 vs 동기 정리**:

| 단계              | 동작 방식                                  |
| ----------------- | ------------------------------------------ |
| 파일 로드 (fetch) | **비동기, 병렬** (A.js, B.js, C.js 동시에) |
| 코드 실행 시작    | **동기적 장벽** (모든 모듈 로드 완료 후)   |
| 실행 순서         | 의존성 순서대로 (leaf → root)              |

더 정확하게 표현하면:

- **I/O (파일 로드)**: 비동기, 병렬
- **실행 시작**: 동기적 장벽 (전부 준비될 때까지 대기)
- **실행 순서**: 동기적, 의존성 순서

---

## 5. Q&A: 병렬 로딩의 실제 이점

### Q: 만약에 a.js가 엄청 크다고 가정하면 CJS는 main.js의 첫 라인에서 오래 걸리고 / ESM은 실행 시작까지 엄청 오래 걸리니 결국 같은 결과 아닌가요?

### A: **단일 의존성**만 보면 맞습니다. 차이는 **여러 독립 모듈**이 있을 때 나타납니다.

**시나리오: a.js(큼), b.js, c.js 로드**

```javascript
// main.js
import { a } from './a.js'; // 3초
import { b } from './b.js'; // 1초
import { c } from './c.js'; // 1초
```

| 방식    | 로드 순서                     | 총 시간       |
| ------- | ----------------------------- | ------------- |
| **CJS** | a(3초) → b(1초) → c(1초) 순차 | **5초**       |
| **ESM** | a, b, c 동시 시작             | **3초** (max) |

```
CJS:  [===a===][=b=][=c=]  → 5초
ESM:  [===a===]            → 3초
      [=b=]
      [=c=]
```

**언제 차이가 없나?**

```javascript
// 직렬 의존성 (a → b → c)
// a.js imports b.js, b.js imports c.js
import { a } from './a.js';
```

이 경우 ESM도 순차 로드가 됩니다 (의존성 체인). 차이 없음.

**언제 차이가 나나?**

```javascript
// 병렬 의존성 (독립적인 모듈들)
import { a } from './a.js';
import { b } from './b.js'; // a와 무관
import { c } from './c.js'; // a, b와 무관
```

| 환경         | 병렬 로드 이점         |
| ------------ | ---------------------- |
| **브라우저** | 큼 (네트워크 I/O 병목) |
| **Node.js**  | 작음 (파일 I/O 빠름)   |

**결론**: **의존성 구조**에 따라 이점이 달라집니다.

---

## 6. Q&A: Top-level Await

### Q: Top-level await가 가능하다 << 이 말은 정확히 뭘 의미하나요?

### A: **함수 바깥(모듈 최상위)**에서 `await`를 쓸 수 있다는 뜻입니다.

**비교**:

```javascript
// CJS - 불가능
const data = await fetch('/api'); // SyntaxError

// 우회해야 함
async function init() {
  const data = await fetch('/api');
  // ...
}
init();
```

```javascript
// ESM - 가능
const data = await fetch('/api'); // OK
export const config = data.json();
```

**실용적인 예시**:

```javascript
// config.js (ESM)
const response = await fetch('/api/config');
export const config = await response.json();

// main.js
import { config } from './config.js'; // config가 이미 resolve된 상태
console.log(config.apiKey); // 바로 사용 가능
```

**요약**: 모듈 자체가 "준비 완료" 상태로 export되므로, 사용하는 쪽에서 초기화 신경 안 써도 됩니다.

---

## 7. Q&A: CJS에서 await가 불가능한 이유

### Q: CJS await 대기 > 불가, 이유: 블로킹됨이 잘 이해가 안 됩니다

### A: `require()`는 **동기 함수**입니다. 동기 함수는 결과를 **즉시 반환**해야 합니다.

**`require()`의 내부 동작 (단순화)**:

```javascript
function require(path) {
  const code = fs.readFileSync(path); // 파일 읽기 (동기)
  const module = { exports: {} };
  runCode(code, module); // 코드 실행
  return module.exports; // ← 즉시 반환해야 함
}
```

**문제 상황**:

```javascript
// config.js
const data = await fetch('/api'); // 1초 걸림
module.exports = data;
```

```javascript
// main.js
const config = require('./config.js'); // 여기서 뭐가 반환됨?
console.log(config);
```

```
require() 호출
    ↓
config.js 실행 시작
    ↓
await fetch() 만남 → ???
    ↓
require()는 지금 당장 return해야 함
근데 data는 아직 없음
```

**동기 함수가 비동기 작업을 기다릴 방법이 없습니다.**

**ESM은 왜 가능한가**:

```javascript
// ESM 모듈 로딩 (단순화)
async function loadModule(path) {
  // ← 비동기 함수
  const code = await fs.promises.readFile(path);
  const module = await runCodeAsync(code); // await 가능
  return module.exports;
}
```

ESM 로더 자체가 **비동기**이므로, 모듈 안의 await를 자연스럽게 기다릴 수 있습니다.

**비유**:

|             | CJS                     | ESM                     |
| ----------- | ----------------------- | ----------------------- |
| 비유        | 전화 (즉시 응답해야 함) | 문자 (나중에 답장 가능) |
| `require()` | "지금 당장 값 줘"       | -                       |
| `import`    | -                       | "준비되면 알려줘"       |

---

## 8. Q&A: CJS 우회 패턴

### Q: 그러면 async 함수로 래핑하거나 즉시실행함수를 써야하나요?

### A: 네, 맞습니다. CJS에서 비동기 초기화가 필요하면 **우회 패턴**을 써야 합니다.

**패턴 1: 팩토리 함수 export**

```javascript
// config.js (CJS)
module.exports = async function getConfig() {
  const res = await fetch('/api/config');
  return res.json();
};

// main.js
const getConfig = require('./config');

async function main() {
  const config = await getConfig(); // 매번 호출
  console.log(config);
}
main();
```

**패턴 2: 즉시실행함수 (IIFE) + 캐싱**

```javascript
// config.js (CJS)
let cached = null;

module.exports = async function getConfig() {
  if (cached) return cached;
  const res = await fetch('/api/config');
  cached = await res.json();
  return cached;
};
```

**패턴 3: Promise export**

```javascript
// config.js (CJS)
module.exports = (async () => {
  const res = await fetch('/api/config');
  return res.json();
})(); // Promise를 export

// main.js
const configPromise = require('./config');

async function main() {
  const config = await configPromise;
  console.log(config);
}
main();
```

**ESM은 이게 필요 없음**:

```javascript
// config.js (ESM)
const res = await fetch('/api/config');
export const config = await res.json();

// main.js
import { config } from './config.js';
console.log(config); // 이미 준비된 값
```

**비교**:

|               | CJS                      | ESM                           |
| ------------- | ------------------------ | ----------------------------- |
| 비동기 초기화 | 래퍼 함수 필요           | top-level await               |
| 사용하는 쪽   | `await getConfig()` 매번 | `import { config }` 그냥 사용 |
| 초기화 보장   | 직접 관리 (캐싱 등)      | 자동 (import 시점에 완료)     |

**요약**: CJS는 "값을 얻는 방법"을 export하고, ESM은 "준비된 값 자체"를 export할 수 있습니다.

---

## 9. Q&A: CJS 메인을 async로 래핑하면?

### Q: CJS가 동기적이라면 메인 엔트리(예를 들어 index.js)를 비동기 함수로 크게 래핑하면 ESM과 비슷해지나요?

### A: **부분적으로 비슷해지지만**, 근본적인 차이가 남습니다.

**비슷해지는 점**:

```javascript
// index.js (CJS)
async function main() {
  const config = await require('./config')();
  const db = await require('./db')();
  // ... 비동기 흐름 가능
}
main();
```

메인에서 await 쓸 수 있으니 **사용 패턴**은 비슷해집니다.

**여전히 다른 점**:

**1. 모듈 로딩은 여전히 순차/동기**

```javascript
// index.js
async function main() {
  const a = require('./a'); // 파일 로드: 동기
  const b = require('./b'); // a 끝나야 시작
  const c = require('./c'); // b 끝나야 시작
}
```

```
CJS:  [load a] → [load b] → [load c]  (순차)
ESM:  [load a]                         (병렬)
      [load b]
      [load c]
```

**2. 각 모듈 내부에서는 여전히 await 불가**

```javascript
// config.js (CJS)
const data = await fetch('/api'); // ❌ 여전히 불가
module.exports = data;

// 여전히 래퍼 필요
module.exports = async () => {
  return await fetch('/api');
};
```

**3. 정적 분석 / Tree-shaking 여전히 불가**

```javascript
// 번들러가 봤을 때
async function main() {
  if (condition) {
    require('./heavy'); // 런타임에 결정 → 분석 불가
  }
}
```

**비교 정리**:

| 항목              | CJS + async main | ESM         |
| ----------------- | ---------------- | ----------- |
| 메인에서 await    | O                | O           |
| 각 모듈에서 await | X (래퍼 필요)    | O           |
| 모듈 로딩         | 순차 동기        | 병렬 비동기 |
| Tree-shaking      | X                | O           |

**결론**: **사용 편의성**은 비슷해질 수 있지만, **런타임 동작**(병렬 로딩, 정적 분석)은 달라지지 않습니다. 메인만 async로 감싸는 건 "CJS의 한계를 우회"하는 것이고, ESM은 "처음부터 비동기 설계"입니다.

---

## 10. 추가 학습 포인트

### Live Binding vs Value Copy (중요)

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

### 순환 참조 처리 차이

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

### Dynamic Import (둘 다 가능)

```javascript
// 조건부 로딩 (ESM, CJS 모두)
const module = await import('./heavy.js');
```

### Dual Package (라이브러리 배포 시)

```json
// package.json
{
  "main": "./dist/index.cjs", // CJS 사용자용
  "module": "./dist/index.mjs", // ESM 사용자용
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## 11. 학습 우선순위

| 순위 | 개념                       | 이유                   |
| ---- | -------------------------- | ---------------------- |
| 1    | Live binding vs Value copy | 버그 원인이 될 수 있음 |
| 2    | Dynamic import             | 코드 스플리팅에 필수   |
| 3    | 순환 참조                  | 디버깅 시 알아야 함    |
| 4    | Dual package               | 라이브러리 배포 시     |

---

## 요약

| 항목            | CJS                            | ESM                   |
| --------------- | ------------------------------ | --------------------- |
| 문법            | `require()` / `module.exports` | `import` / `export`   |
| 로딩            | 동기, 순차                     | 비동기, 병렬          |
| 정적 분석       | 불가                           | 가능                  |
| Tree-shaking    | 어려움                         | 가능                  |
| Top-level await | 불가                           | 가능                  |
| 바인딩          | Value copy                     | Live binding          |
| 설계 철학       | 런타임 중심                    | 빌드 타임 최적화 중심 |

**결론**: 새 프로젝트는 ESM을 사용하세요. CJS는 레거시 호환성을 위해 알아두면 좋습니다.

---

_작성일: 2026-02-02_
