# 5. `__dirname`과 `process.cwd()`

[← 목차로 돌아가기](./README.md) | [← 이전: Top-level Await](./04-top-level-await.md)

---

## Q&A: `__dirname`과 `__filename`이란?

### Q: `__dirname`과 `__filename`이 뭐고, 왜 CJS에서는 기본 제공되고 ESM에서는 직접 구현해야 하나요?

### A: CJS 모듈 래퍼 함수의 매개변수입니다.

| 항목         | 설명                                             |
| ------------ | ------------------------------------------------ |
| `__filename` | 현재 모듈 파일의 **절대 경로** (파일명 포함)     |
| `__dirname`  | 현재 모듈 파일이 위치한 **디렉토리의 절대 경로** |

**CJS에서 기본 제공되는 이유**:

Node.js가 모듈을 **래퍼 함수**로 감쌉니다:

```javascript
// Node.js가 실제로 실행하는 코드
(function (exports, require, module, __filename, __dirname) {
  // 여러분의 코드가 여기 들어감
});
```

**ESM에서 없는 이유**:

| 구분     | CJS                        | ESM                                 |
| -------- | -------------------------- | ----------------------------------- |
| **출처** | Node.js 자체 구현          | ECMAScript 공식 표준                |
| **대상** | Node.js 전용               | 브라우저/Node/Deno/Bun 모두         |
| **철학** | "Node에 필요한 건 다 넣자" | "공통만 정의, 확장은 런타임에 위임" |

---

## ESM에서 구현하는 방법

```javascript
// Node.js ESM
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

**Node.js 20.11+ 간편 방법**:

```javascript
console.log(import.meta.dirname); // __dirname과 동일
console.log(import.meta.filename); // __filename과 동일
```

---

## Q&A: `__dirname` vs `process.cwd()`

### Q: `__dirname`은 `cwd`와 매칭되나요?

### A: **둘 다 절대 경로**입니다. 차이는 **기준점**입니다.

| 개념            | 설명                                       | 기준        |
| --------------- | ------------------------------------------ | ----------- |
| `process.cwd()` | 프로세스가 **실행된** 디렉토리의 절대 경로 | 터미널 위치 |
| `__dirname`     | 파일이 **위치한** 디렉토리의 절대 경로     | 파일 위치   |

**한 마디 요약**:

| 개념            | 한 마디           |
| --------------- | ----------------- |
| `process.cwd()` | "내가 서 있는 곳" |
| `__dirname`     | "파일이 사는 곳"  |

---

## 예시로 검증

```
/project/
├── A/
│   └── some.js   ← process.cwd()와 __dirname 출력
└── B/
```

```javascript
// /project/A/some.js
console.log('cwd:', process.cwd());
console.log('__dirname:', __dirname);
```

| 실행 위치    | 실행 명령                 | `process.cwd()` | `__dirname`  |
| ------------ | ------------------------- | --------------- | ------------ |
| `/project/A` | `node some.js`            | `/project/A`    | `/project/A` |
| `/project`   | `node A/some.js`          | `/project`      | `/project/A` |
| `/`          | `node /project/A/some.js` | `/`             | `/project/A` |

---

## 왜 중요한가?

```javascript
// ❌ 실행 위치에 따라 다른 결과
fs.readFileSync('./config.json'); // cwd 기준

// ✅ 항상 동일한 결과
fs.readFileSync(path.join(__dirname, './config.json')); // 파일 위치 기준
```

상대 경로(`./config.json`)는 **cwd 기준**으로 해석됩니다.

---

[다음: import.meta 심화 →](./06-import-meta.md)
