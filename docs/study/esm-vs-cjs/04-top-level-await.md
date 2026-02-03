# 4. Top-level Await

[← 목차로 돌아가기](./README.md) | [← 이전: 모듈 로딩](./03-loading.md)

---

## Q&A: Top-level await란?

### Q: Top-level await가 가능하다는 건 뭘 의미하나요?

### A: **함수 바깥(모듈 최상위)**에서 `await`를 쓸 수 있다는 뜻입니다.

```javascript
// CJS - 불가능
const data = await fetch('/api'); // SyntaxError

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

---

## Q&A: CJS에서 await가 불가능한 이유

### Q: CJS에서 왜 await를 쓸 수 없나요?

### A: `require()`는 **동기 함수**입니다. 결과를 **즉시 반환**해야 합니다.

```javascript
function require(path) {
  const code = fs.readFileSync(path); // 동기
  const module = { exports: {} };
  runCode(code, module);
  return module.exports; // ← 즉시 반환해야 함
}
```

**문제 상황**:

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

**비유**:

|             | CJS                     | ESM                     |
| ----------- | ----------------------- | ----------------------- |
| 비유        | 전화 (즉시 응답해야 함) | 문자 (나중에 답장 가능) |
| `require()` | "지금 당장 값 줘"       | -                       |
| `import`    | -                       | "준비되면 알려줘"       |

---

## CJS 우회 패턴

CJS에서 비동기 초기화가 필요하면 **우회 패턴**을 써야 합니다.

### 패턴 1: 팩토리 함수 export

```javascript
// config.js (CJS)
module.exports = async function getConfig() {
  const res = await fetch('/api/config');
  return res.json();
};

// main.js
const getConfig = require('./config');
const config = await getConfig(); // 매번 호출
```

### 패턴 2: Promise export

```javascript
// config.js (CJS)
module.exports = (async () => {
  const res = await fetch('/api/config');
  return res.json();
})(); // Promise를 export

// main.js
const config = await require('./config');
```

### ESM은 이게 필요 없음

```javascript
// config.js (ESM)
const res = await fetch('/api/config');
export const config = await res.json();

// main.js
import { config } from './config.js';
console.log(config); // 이미 준비된 값
```

---

## Q&A: CJS 메인을 async로 래핑하면?

### Q: 메인을 async 함수로 크게 래핑하면 ESM과 비슷해지나요?

### A: **사용 패턴**은 비슷해지지만, **근본적인 차이**가 남습니다.

| 항목              | CJS + async main | ESM         |
| ----------------- | ---------------- | ----------- |
| 메인에서 await    | O                | O           |
| 각 모듈에서 await | X (래퍼 필요)    | O           |
| 모듈 로딩         | 순차 동기        | 병렬 비동기 |
| Tree-shaking      | X                | O           |

**결론**: 메인만 async로 감싸는 건 "CJS의 한계를 우회"하는 것이고, ESM은 "처음부터 비동기 설계"입니다.

---

[다음: \_\_dirname과 cwd →](./05-dirname-cwd.md)
