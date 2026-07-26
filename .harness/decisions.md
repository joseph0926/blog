---
updated: 2026-07-26
baseline_revision: 314c3f0be6976711d8629cc39d25f85748e32baa
status: review-needed
---

# 무엇을 왜 정했나

확정된 판단과 그 이유를 append로 쌓는다. 같은 결정을 다시 협상하지 않기 위한 문서다.

**현재 확정 기록은 없다.** 아래는 git 히스토리에서 되돌린 흔적이 뚜렷한 **후보**이고, "왜"는 사람만 안다. 채워지기 전까지는 근거로 인용하지 않는다.

## 후보 (왜 = 미확인)

### Prisma 제거

- 커밋: `ec912e4 chore: delete prisma`, `299c0b2`/`1b56d2f refactor: ci에서 db 작업 제거`
- 관찰: DB 계층을 걷어내고 CI에서도 db 스텝을 없앴다. 현재 글은 `src/mdx/**` 파일이 소유한다.
- 왜: 미확인
- 버린 대안: 미확인
- 영향 범위: `services/post.service.ts`, CI workflow, 콘텐츠 추가 흐름 전체

### ESLint v9 롤백

- 커밋: `5dbd651 chore: eslint v10, typescript v6` → `197693a fix: eslint v9로 롤백`
- 관찰: v10으로 올렸다가 되돌렸다. TypeScript 6은 유지됐다.
- 왜: 미확인 — 되돌린 이유를 모르면 다음에 같은 업그레이드를 다시 시도하게 된다
- 버린 대안: 미확인
- 영향 범위: `eslint.config.mjs`, lint gate

### 테스트 커버리지 임계 제거

- 커밋: `85bbd81 fix: 테스트 커버리지 제한 삭제`
- 관찰: CI는 `--coverage`로 리포트만 내고 임계로 실패시키지 않는다.
- 왜: 미확인
- 버린 대안: 미확인
- 영향 범위: `apps/blog/vitest.config.ts`, CI gate 강도

## 항목 형식

새 결정을 추가할 때는 이 형식을 쓴다.

```md
## YYYY-MM-DD — <한 줄 결정>

- 맥락: 왜 결정이 필요했나
- 결정: 무엇으로 정했나
- 근거: 왜 그것인가
- 버린 대안: 무엇을 왜 안 골랐나
- 영향 범위: 어느 경로·계약이 이 결정에 묶이나
```

"무엇을"만 적고 "왜"를 빠뜨리면 다음 세션이 같은 결정을 다시 뒤집는다.
