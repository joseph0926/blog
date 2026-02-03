# 9. 퀴즈 복습 노트

[← 목차로 돌아가기](./README.md) | [← 이전: 추가 학습 TODO](./08-todo.md)

---

## 퀴즈 결과 요약

- **일시**: 2026-02-04
- **범위**: 01-basics ~ 06-import-meta
- **점수**: 6.5 / 9 (약 72%)

---

## Round 1: 기초 (정의/구분)

### Q1. ESM ↔ CJS 상호 운용

**질문**: ESM에서 CJS 모듈을 import할 수 있나요? 반대로 CJS에서 ESM 모듈을 require할 수 있나요?

**내 답변**: ESM → CJS 가능 / 반대 불가능

**채점**: ✅ 정답 (부분)

**보충**:

- CJS에서 ESM을 쓰려면 `await import('esm-pkg')` (dynamic import)로 우회 가능

```javascript
// CJS에서 ESM 모듈 사용
const esmModule = await import('esm-pkg');
```

---

### Q2. package.json ESM 설정

**질문**: `package.json`에서 ESM을 사용하려면 어떤 설정이 필요한가요?

**내 답변**: `"type": "module"`

**채점**: ✅ 정답

---

### Q3. ESM 정적 분석 가능 이유

**질문**: ESM의 정적 분석이 가능한 이유를 한 문장으로 설명해주세요.

**내 답변**: import가 파일 맨 위 고정, export가 파일 맨 아래 고정

**채점**: ⚠️ 부분 정답

**수정 필요**:

- `import`는 최상단 고정 ✅
- `export`는 아래 고정이 아님 (어디든 가능, 하지만 **조건문 안에는 불가**)

**핵심**: export도 **조건문 안에 못 들어감** → 정적으로 "뭘 내보내는지" 확정됨

```javascript
// CJS - 런타임에 결정
module.exports = condition ? { a } : { b }; // 뭘 내보낼지 모름

// ESM - 빌드 타임에 확정
export { a, b }; // 항상 a, b를 내보냄
```

---

## Round 2: 중급 (동작/흐름)

### Q4. CJS Value Copy ⚠️ 취약 포인트

**질문**: 아래 코드의 출력 결과와 그 이유를 설명해주세요.

```javascript
// counter.js (CJS)
let count = 0;
module.exports = { count, increment: () => count++ };

// main.js
const { count, increment } = require('./counter');
console.log(count);
increment();
console.log(count);
```

**내 답변**: 0, 0 인건 알겠으나 자세한 이유 모르겠음

**채점**: 🔴 설명 필요

**핵심 개념: CJS는 "값 복사(Value Copy)"**

```javascript
// counter.js
let count = 0;
module.exports = { count, increment: () => count++ };
```

이 코드가 실행되는 순간:

```javascript
module.exports = {
  count: 0,        // ← count의 "현재 값" 0이 복사됨
  increment: ...
};
```

`require()` 하면:

```javascript
const { count } = require('./counter');
// count = 0 (복사된 값)

increment(); // 원본 count가 1이 됨
console.log(count); // 여전히 0 (복사본은 안 바뀜)
```

**비유**:
| 모듈 시스템 | 비유 |
|-------------|------|
| CJS | 사진을 찍어서 줌 (원본이 바뀌어도 사진은 그대로) |
| ESM | 실시간 화상통화 (원본 변화가 바로 보임) |

---

### Q5. ESM 로딩 3단계

**질문**: ESM 로딩의 3단계를 순서대로 말하고, "장벽"이 어디에 있는지 설명해주세요.

**내 답변**: 번들 비동기 로드 → 장벽 → 의존성대로 실행

**채점**: ⚠️ 부분 정답

**정확한 용어**:

1. **Construction** (파싱) - import 문 발견, 모듈 그래프 구축
2. **Instantiation** (연결) - export/import 바인딩
3. ═══ **장벽** ═══ (모든 모듈 준비 완료)
4. **Evaluation** (실행) - 의존성 순서대로 코드 실행

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

---

### Q6. CJS에서 Top-level await 불가 이유

**질문**: CJS에서 Top-level await가 불가능한 근본적인 이유는 무엇인가요?

**내 답변**: CJS 모듈은 동기함수임

**채점**: ✅ 정답

**보충**: `require()`가 **즉시 값을 반환**해야 해서 Promise를 기다릴 수 없음

---

## Round 3: 심화 (디버깅/설계)

### Q7. `__dirname` vs `cwd` 디버깅

**질문**: 아래 상황에서 문제가 발생합니다. 원인과 해결책을 말해주세요.

```
/project/
├── scripts/
│   └── build.js
└── config.json

// build.js
const config = fs.readFileSync('./config.json');
```

`/project`에서 `node scripts/build.js` 실행 시 config.json을 찾지 못합니다.

**내 답변**: fs.readFileSync는 process.cwd를 활용하여 build.js에서 해당 코드를 실행하면 scripts/build.js 에서 ./config.js를 찾으므로 에러

**채점**: ⚠️ 부분 정답

**정리**:

- `./config.json` → cwd 기준 → `/project/config.json` (존재함)
- 근데 개발자 의도는 build.js **옆에 있는** config.json일 수 있음

**해결책**:

```javascript
// CJS
path.join(__dirname, './config.json');

// ESM (Node 20.11+)
path.join(import.meta.dirname, './config.json');
```

---

### Q8. `import.meta` 확장 지점

**질문**: `import.meta`가 ESM 스펙에서 "확장 지점"이라는 의미가 무엇인지 설명해주세요.

**내 답변**: import.meta는 빈 객체 / 여러 런타임들이 각자 특성 추가

**채점**: ✅ 정답

**구조 다이어그램**:

```
┌─────────────────────────────────────────┐
│           ECMAScript 스펙               │
│  "import.meta는 객체다. 내용은 호스트가 │
│   채운다."                              │
└─────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ 브라우저 │ │ Node.js │ │  Vite   │
│         │ │         │ │(번들러) │
│ .url    │ │ .url    │ │ .url    │
│         │ │ .dirname│ │ .env    │
│         │ │ .resolve│ │ .hot    │
│         │ │         │ │ .glob   │
└─────────┘ └─────────┘ └─────────┘
```

---

### Q9. Dual Package 설정 📚 학습 포인트

**질문**: 라이브러리를 ESM/CJS 사용자 모두 지원하도록 배포하려면 `package.json`에 어떤 설정이 필요한가요?

**내 답변**: 아직 안배움

**정답**:

```json
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

- `import`로 부르면 → `.mjs` 제공
- `require`로 부르면 → `.cjs` 제공

---

## 복습 우선순위

| 순위 | 주제                                | 이유                          | 상태         |
| ---- | ----------------------------------- | ----------------------------- | ------------ |
| 1    | **Value Copy vs Live Binding (Q4)** | 실무 버그 원인이 될 수 있음   | 🔴 복습 필요 |
| 2    | **ESM 로딩 3단계 용어 (Q5)**        | 면접 빈출                     | ⚠️ 용어 암기 |
| 3    | **Dual Package exports (Q9)**       | 라이브러리 배포 시 필수       | 📚 새로 학습 |
| 4    | **정적 분석 가능 이유 (Q3)**        | import/export 둘 다 설명 필요 | ⚠️ 보충 필요 |

---

## 다음 학습 액션

- [ ] Q4 Value Copy/Live Binding 코드 직접 실행해보기
- [ ] Q5 ESM 로딩 3단계 용어 (Construction/Instantiation/Evaluation) 암기
- [ ] Q9 Dual Package 설정 실제 프로젝트에 적용해보기
- [ ] 1주일 후 동일 퀴즈 재응시 목표: 8/9 이상

---

_작성일: 2026-02-04_
