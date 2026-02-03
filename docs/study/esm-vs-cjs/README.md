# Node.js 모듈 시스템: ESM vs CJS

> Node.js 환경에서 ES Modules(ESM)과 CommonJS(CJS)의 차이를 Q&A 형식으로 정리한 문서입니다.

## 문서 구조

| 파일                                             | 내용                                                  | 복습 우선순위 |
| ------------------------------------------------ | ----------------------------------------------------- | ------------- |
| [01-basics.md](./01-basics.md)                   | 핵심 차이, 문법, 설정, 상호 운용                      | ⭐⭐⭐        |
| [02-advanced.md](./02-advanced.md)               | Live Binding, 순환 참조, Dynamic Import, Dual Package | ⭐⭐⭐        |
| [03-loading.md](./03-loading.md)                 | 정적 분석, 비동기 로딩, ESM 3단계, 병렬 로딩          | ⭐⭐          |
| [04-top-level-await.md](./04-top-level-await.md) | Top-level await, CJS 우회 패턴                        | ⭐⭐          |
| [05-dirname-cwd.md](./05-dirname-cwd.md)         | `__dirname`, `__filename`, `process.cwd()`            | ⭐⭐          |
| [06-import-meta.md](./06-import-meta.md)         | `import.meta` 심화, 설계 철학                         | ⭐            |
| [07-checklist.md](./07-checklist.md)             | 자기 점검 체크리스트                                  | 복습용        |
| [08-todo.md](./08-todo.md)                       | 추가 학습 TODO 리스트                                 | 확장용        |

## 빠른 요약

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

## 학습 순서 추천

1. **기초** → [01-basics.md](./01-basics.md) + [02-advanced.md](./02-advanced.md)
2. **심화** → [03-loading.md](./03-loading.md) + [04-top-level-await.md](./04-top-level-await.md)
3. **실무** → [05-dirname-cwd.md](./05-dirname-cwd.md) + [06-import-meta.md](./06-import-meta.md)
4. **복습** → [07-checklist.md](./07-checklist.md)
5. **확장** → [08-todo.md](./08-todo.md)

---

_작성일: 2026-02-02_
_업데이트: 2026-02-03 (문서 분리)_
