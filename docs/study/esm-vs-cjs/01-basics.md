# 1. 기본 개념

[← 목차로 돌아가기](./README.md)

---

## ESM vs CJS 핵심 차이

| 항목                         | CommonJS (CJS)                | ES Modules (ESM)               |
| ---------------------------- | ----------------------------- | ------------------------------ |
| **문법**                     | `require()`, `module.exports` | `import`, `export`             |
| **로딩**                     | 동기(synchronous)             | 비동기(asynchronous)           |
| **파싱**                     | 런타임에 평가                 | 정적 분석 가능 (빌드 타임)     |
| **파일 확장자**              | `.js`, `.cjs`                 | `.mjs` 또는 `"type": "module"` |
| **Top-level await**          | 불가                          | 가능                           |
| **`__dirname`/`__filename`** | 기본 제공                     | 직접 구현 필요                 |
| **Tree-shaking**             | 어려움                        | 가능 (정적 분석)               |

---

## 문법 비교

```javascript
// CJS
const fs = require('fs');
module.exports = { foo: 'bar' };

// ESM
import fs from 'fs';
export const foo = 'bar';
```

---

## `__dirname` ESM에서 사용하기

```typescript
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

> 자세한 내용은 [05-dirname-cwd.md](./05-dirname-cwd.md) 참고

---

## package.json 설정

```json
// CJS (기본)
{ "type": "commonjs" }

// ESM
{ "type": "module" }
```

---

## 상호 운용

| 방향                | 가능 여부                                             |
| ------------------- | ----------------------------------------------------- |
| ESM에서 CJS import  | 가능 (`import x from 'cjs-pkg'`)                      |
| CJS에서 ESM require | 불가 (dynamic import 필요: `await import('esm-pkg')`) |

---

[다음: 심화 개념 →](./02-advanced.md)
