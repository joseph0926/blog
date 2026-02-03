# 7. 체크리스트

[← 목차로 돌아가기](./README.md) | [← 이전: import.meta 심화](./06-import-meta.md) | [다음: 추가 학습 TODO →](./08-todo.md)

---

## ESM vs CJS 기본

- [ ] ESM과 CJS의 문법 차이를 설명할 수 있다
- [ ] 정적 분석과 비동기 로딩이 다른 시점을 가리킴을 안다
- [ ] ESM 로딩 3단계 (Construction → Instantiation → Evaluation)를 안다
- [ ] Top-level await가 ESM에서만 가능한 이유를 안다
- [ ] Live binding vs Value copy 차이를 코드로 설명할 수 있다

---

## `__dirname` / `cwd` / `import.meta`

- [ ] `__dirname`이 전역 변수가 아닌 이유를 설명할 수 있다
- [ ] CJS 모듈 래퍼 함수의 5개 매개변수를 말할 수 있다
- [ ] `process.cwd()`와 `__dirname` 둘 다 절대 경로임을 안다
- [ ] 상대 경로가 cwd 기준으로 해석됨을 안다
- [ ] `__dirname`은 실행 위치와 무관하게 고정임을 안다
- [ ] ESM에서 `__dirname`이 없는 설계 이유를 말할 수 있다
- [ ] `import.meta.url`과 파일 경로의 차이를 안다
- [ ] `import.meta`가 ESM 전용 객체임을 안다
- [ ] 스펙은 껍데기만 정의하고 런타임이 내용을 채움을 안다
- [ ] Node.js와 Vite에서 제공하는 `import.meta` 속성이 다름을 안다
- [ ] Node.js 20.11+에서 `import.meta.dirname`을 쓸 수 있다는 걸 안다

---

## 요약 테이블

| 항목            | CJS                            | ESM                   |
| --------------- | ------------------------------ | --------------------- |
| 문법            | `require()` / `module.exports` | `import` / `export`   |
| 로딩            | 동기, 순차                     | 비동기, 병렬          |
| 정적 분석       | 불가                           | 가능                  |
| Tree-shaking    | 어려움                         | 가능                  |
| Top-level await | 불가                           | 가능                  |
| 바인딩          | Value copy                     | Live binding          |
| 설계 철학       | 런타임 중심                    | 빌드 타임 최적화 중심 |

---

## 결론

> 새 프로젝트는 ESM을 사용하세요. CJS는 레거시 호환성을 위해 알아두면 좋습니다.

---

_작성일: 2026-02-02_
_업데이트: 2026-02-03 (문서 구조 개선, 파일 분리)_
