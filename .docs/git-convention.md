# Git Convention

커밋 메시지는 scope를 생략한 Conventional Commits 형식 `type: 한국어 제목`을 사용한다.

- 제목은 한 줄로 간결하게 쓴다.
- 예: `chore: 블로그 AI 하네스 전면 교체`, `docs: 글 번역 추가`
- 커밋 제안은 변경 파일을 명시한 다음 형태의 복사 가능한 명령으로 제공한다.

```sh
git add <변경 파일...>
git commit -m 'type: 한국어 제목'
```
