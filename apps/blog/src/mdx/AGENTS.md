# MDX content guide

이 디렉터리는 게시글 원문, 영어 번역본과 실행형 교육 데모의 호출 지점을 소유한다. 용어는 저장소 루트 `CONTEXT.md`, 번역 결정은 `docs/adr/0001-source-bound-translation-pipeline.md`를 따른다.

## 원문과 번역본

- `YYYY-MM-DD-{slug}.mdx`는 한국어 원문이다.
- 같은 slug의 `YYYY-MM-DD-{slug}.en.mdx`는 영어 번역본이다.
- 한국어 원문을 변경하면 같은 작업에서 영어 번역본도 동기화한다.
- 영어 번역은 주장, 수치, 인용, heading 구조, link, code와 기술 용어를 보존한다.
- Codex 또는 Claude Code가 번역한 뒤 마지막 단계에서만 `anti-slop-english`로 검수한다.
- 의미 이탈이 발견되면 검수 단계에서 조용히 고치지 않고 번역 단계로 되돌린다.

새 번역이나 변경된 원문의 영어 frontmatter에는 다음 형식의 `sourceHash`가 필요하다.

```yaml
sourceHash: sha256:<한국어 MDX 전체 bytes의 SHA-256>
```

`sourceHash`는 번역과 최종 검수가 끝난 뒤 갱신한다. AI 도구 이름이나 검수 metadata는 저장소 파일에 기록하지 않고 completion receipt에서만 보고한다.

기존 영어 번역본에 `sourceHash`가 없으면 `apps/blog/scripts/content-legacy-baseline.json`에 기록된 한국어와 영어 파일 hash가 모두 현재 bytes와 일치할 때만 approved legacy로 허용한다. 어느 파일이든 hash가 달라지면 새 계약으로 전환하며, 번역과 최종 검수 뒤 `sourceHash`를 기록하고 baseline entry를 제거해야 한다. 새 legacy entry는 자동 생성하지 않는다.

## Frontmatter와 참조

- 필수 field는 `slug`, `title`, `description`, `date`, `tags`다.
- `slug`는 locale suffix를 제외한 파일명과 같아야 한다.
- `thumbnail`은 선택 field이며 `apps/blog/public` 아래의 실제 자산을 가리켜야 한다.
- 실행형 대문자 JSX component는 `component-registry.ts`에 등록한다.
- Fenced code와 inline code 안의 예시는 runtime component나 asset 참조가 아니다.

기존 slug 불일치는 같은 baseline의 파일 hash, expected와 actual이 모두 일치할 때만 경고로 허용한다. 해당 파일을 변경하면 slug를 바로잡고 baseline entry를 제거한다. 해결된 violation의 stale entry도 오류다.

## 검증

순수 본문, frontmatter와 정적 자산 변경은 `content` profile을 사용한다. `src/mdx/components/**`를 변경하면 `integrated` profile로 승격한다.

```sh
./scripts/verify.sh --profile content --stage quick
./scripts/verify.sh --profile content --stage final
```
