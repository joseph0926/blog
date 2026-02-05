# 10. Value Copy vs Live Binding 심화

[← 목차로 돌아가기](./README.md) | [← 이전: 퀴즈 복습](./09-quiz-review.md)

---

> CJS의 value copy와 ESM의 live binding이 **왜, 어떻게** 다른지를 근본 원리부터 정리합니다.

---

## 핵심 요약

- CJS의 `module.exports = { count }`에서 복사가 일어나는 건 CJS의 특별한 기능이 아니라, **JavaScript의 기본 동작**(객체 리터럴 평가 시 원시값은 값 복사)
- CJS에서 참조값(객체)을 export하면 **프로퍼티 수정은 반영되지만, 변수 재할당은 반영 안 됨**
- ESM의 live binding은 **변수 바인딩(이름 → 메모리 슬롯 연결) 자체를 공유**하므로 재할당까지도 반영됨
- import한 쪽에서는 **읽기 전용** (쓰기 불가)

---

## 1. "객체 리터럴 평가 시점"이란?

### Q. `module.exports = { count }` 에서 "평가 시점"이 뭔가요?

JavaScript 엔진이 `{ count }` 라는 **표현식을 실행(evaluate)하는 바로 그 순간**을 의미합니다.

```javascript
// counter.js (CJS)
let count = 0;

function increment() {
  count++;
}

module.exports = { count, increment };
//                 ↑↑↑↑↑
//          이 줄이 "실행"되는 순간 = 객체 리터럴 평가 시점
```

엔진이 하는 일을 단계별로 풀면:

```javascript
module.exports = { count, increment };

// 1. 새 객체를 생성한다         → {}
// 2. count 식별자를 평가한다    → 현재 count 변수의 값(0)을 읽는다
// 3. 프로퍼티 "count"에 0을 할당 → { count: 0 }
// 4. increment 식별자를 평가    → 함수 참조를 읽는다
// 5. 프로퍼티 "increment"에 할당 → { count: 0, increment: [Function] }
// 6. 완성된 객체를 module.exports에 할당
```

**2단계**에서 `count` 변수의 현재 값을 **스냅샷**하는 것이 핵심입니다.

---

## 2. CJS의 복사 = JavaScript의 기본 동작

### Q. `module.exports`가 뭔가 특별한 복사를 하나요?

**아닙니다.** CJS에 특별한 복사 메커니즘이 있는 게 아닙니다. 일반적인 JS 코드와 완전히 동일합니다.

```javascript
const a = 10;
const obj = { a }; // obj.a === 10 (값 복사)

// 풀어 쓰면:
const obj = { a: a }; // a의 현재 값 10을 프로퍼티에 넣음
```

```javascript
// 증명
let a = 10;
const obj = { a };

a = 999;
console.log(obj.a); // 10 — 변수 a가 바뀌어도 obj.a는 그대로
```

`module.exports = { count }`도 이것과 **완전히 동일**합니다:

```javascript
let count = 0;
const 아무객체 = { count }; // 아무객체.count === 0
module.exports = 아무객체; // module.exports는 그냥 객체를 담는 변수
```

### 왜 이게 "CJS의 특성"이라고 불리는가?

CJS 자체가 뭔가 복사하는 게 아니라, **CJS의 export 방식(`module.exports = ...`)이 "객체에 값을 담는 것"이기 때문에** 자연스럽게 원시값이 복사됩니다.

반면 ESM의 `export let count`는 JavaScript 엔진 레벨에서 **변수 바인딩 자체를 공유**하는 별도의 메커니즘입니다.

---

## 3. 참조값(객체)인 경우

### Q. 원시값이 아니라 객체를 export하면 어떻게 되나요?

참조값(객체)인 경우, **참조(메모리 주소)가 복사**됩니다. 원본과 export된 것이 **같은 객체를 가리킵니다.**

```javascript
// counter.js
const state = { count: 0 };

function increment() {
  state.count++;
}

module.exports = { state, increment };
```

```javascript
// main.js
const counter = require('./counter');

counter.increment();
console.log(counter.state.count); // 1 ✅ 바뀐다!
```

### 핵심 구분: "프로퍼티 수정" vs "재할당"

#### 되는 것: 프로퍼티 수정 (mutation)

같은 객체를 가리키고 있으므로 한쪽에서 프로퍼티를 바꾸면 다른 쪽에서도 보입니다.

```
모듈 내부의 state ──┐
                    ├──▶ { count: 0 }  (힙의 같은 객체)
counter.state ──────┘
```

#### 안 되는 것: 변수 재할당

```javascript
// counter.js
let state = { count: 0 };

function reset() {
  state = { count: 0 }; // ← 새 객체를 만들어서 변수에 재할당
}

module.exports = { state, reset };
```

```javascript
// main.js
const counter = require('./counter');

counter.state.count = 5;
counter.reset();
console.log(counter.state.count); // 5 ❌ 안 바뀐다!
```

```
평가 시점:
  모듈 state ──┐
               ├──▶ { count: 0 }  ← 객체 A
  counter.state┘

reset() 호출 후:
  모듈 state ──────▶ { count: 0 }  ← 객체 B (새로 만든 것)
  counter.state ───▶ { count: 5 }  ← 객체 A (여전히 옛날 것)
```

### CJS에서 원시값 vs 참조값 정리

| 타입                                 | `module.exports = { x }` 시 복사되는 것 | 원본 변경 반영?                            |
| ------------------------------------ | --------------------------------------- | ------------------------------------------ |
| **원시값** (number, string, boolean) | 값 자체                                 | 안 됨                                      |
| **참조값** (object, array, function) | 참조(주소)                              | **프로퍼티 수정**은 됨, **재할당**은 안 됨 |

---

## 4. "변수 바인딩 공유"의 정확한 의미

### Q. ESM의 "바인딩을 공유한다"가 정확히 무슨 뜻인가요?

#### 바인딩(binding) = "이름"과 "메모리 슬롯"의 연결

```javascript
let count = 0;
```

이 한 줄이 실행되면 엔진 내부에서:

```
┌─────────────┐
│  이름: count │ ──────▶  [ 메모리 슬롯: 0 ]
└─────────────┘
    (바인딩)              (현재 들어있는 값)
```

- **바인딩** = `count`라는 이름이 특정 메모리 슬롯을 가리키는 연결
- **값** = 그 슬롯에 현재 들어있는 것 (`0`)

#### CJS: "값"을 꺼내서 새 바인딩에 넣는다

```
counter.js 내부:
  count(바인딩) ──▶ [ 슬롯 A: 0 ]

module.exports 객체:
  { count: 0 }  ← 슬롯 A에서 값 0을 "꺼내서" 프로퍼티에 넣었음
       ↑
  [ 슬롯 B: 0 ]  ← 별개의 저장 공간
```

슬롯 A와 슬롯 B는 **서로 독립**입니다. A가 바뀌어도 B는 모릅니다.

#### ESM: "바인딩 자체"를 공유한다

```javascript
// counter.mjs
export let count = 0;
```

```javascript
// main.mjs
import { count } from './counter.mjs';
```

```
counter.mjs 내부:
  count(바인딩) ──▶ [ 슬롯 A: 0 ]

main.mjs 내부:
  count ─────────▶ [ 슬롯 A: 0 ]  ← 같은 슬롯!
                          ↑
              별도의 슬롯을 만들지 않는다
```

`import { count }`는 새 슬롯을 만들지 않습니다. main.mjs의 `count`라는 이름이 **counter.mjs의 원본 슬롯을 직접 가리킵니다.** 이것이 "바인딩 공유"입니다.

#### import한 쪽에서는 읽기 전용

```javascript
import { count } from './counter.mjs';

count = 99; // ❌ TypeError: Assignment to constant variable.
```

값을 바꿀 수 있는 건 **export한 모듈만**입니다.

### ESM vs CJS 비교

|         | 프로퍼티 수정 | 변수 재할당           |
| ------- | ------------- | --------------------- |
| **CJS** | 반영됨        | 반영 안 됨            |
| **ESM** | 반영됨        | 반영됨 (live binding) |

---

## 5. 화이트보드 비유로 전체 정리

### 등장인물

- **작성자** = export하는 모듈
- **읽는 사람** = import/require하는 모듈
- **화이트보드** = 변수 (메모리 슬롯)
- **화이트보드에 적힌 숫자** = 현재 값

### CJS + 원시값 — "사진 찍어가기"

작성자의 방에 화이트보드가 있고, 거기에 `0`이라고 적혀 있습니다.

읽는 사람이 `require()`로 방문합니다.

> "이 숫자 필요해요."
>
> "네, **사진 찍어 가세요.**"

나중에 작성자가 화이트보드를 `1`로 고쳐도, 읽는 사람의 사진은 여전히 `0`입니다.

### CJS + 참조값(객체) — "공유 회의실 방 번호 받기"

화이트보드가 **공유 회의실**에 있습니다. 작성자가 회의실 **방 번호**를 알려줍니다.

> "302호에 가면 화이트보드 있어요."

읽는 사람은 방 번호(참조)를 받아서 직접 302호에 갑니다.

- 작성자가 화이트보드에 내용을 고치면? → 읽는 사람도 바뀐 게 보임 (**프로퍼티 수정**)
- 작성자가 "이제 405호로 옮겼어요"라고 하면? → 읽는 사람은 여전히 302호에 가므로 **모름** (**재할당**)

### ESM — "창문으로 실시간 보기"

> "사진 찍지 마세요. 제 화이트보드에 **창문을 뚫어줄게요.** 언제든 들여다보세요."

- 작성자가 숫자를 바꾸면? → 창문으로 바로 보임 (**재할당도 반영**)
- 읽는 사람이 손을 넣어서 고칠 수 있나? → **아니요, 읽기 전용 창문** (import는 read-only)

### 비유 한눈에 정리

| 상황             | 비유                     | 원본 변경 시                                          |
| ---------------- | ------------------------ | ----------------------------------------------------- |
| **CJS + 원시값** | 사진 찍어가기            | 사진은 안 바뀜                                        |
| **CJS + 객체**   | 공유 회의실 방 번호 받기 | 같은 방 화이트보드 수정은 보임, 방 자체를 바꾸면 모름 |
| **ESM**          | 창문으로 실시간 보기     | 뭘 바꾸든 항상 최신이 보임 (단, 읽기만 가능)          |

```
CJS:  작성자의 화이트보드 → [사진] → 읽는 사람의 앨범
      (찍는 순간의 값이 고정)

ESM:  작성자의 화이트보드 → [창문] → 읽는 사람이 실시간 관찰
      (항상 최신, 수정은 불가)
```

---

## 체크리스트

- [ ] `const obj = { a }`가 `a`의 값을 복사하는 JS 기본 동작을 설명할 수 있는가?
- [ ] `module.exports`가 특별한 게 아니라 일반 객체 할당임을 설명할 수 있는가?
- [ ] CJS에서 참조값 export 시 "프로퍼티 수정 O / 재할당 X"를 예시로 보여줄 수 있는가?
- [ ] "바인딩"과 "값"의 차이를 구분해서 설명할 수 있는가?
- [ ] ESM의 live binding이 "같은 메모리 슬롯을 가리킨다"는 것을 다이어그램으로 설명할 수 있는가?
- [ ] import한 쪽에서 값을 수정할 수 없는 이유(read-only binding)를 설명할 수 있는가?

---

[다음: 추가 학습 TODO →](./08-todo.md)

_작성일: 2026-02-05_
