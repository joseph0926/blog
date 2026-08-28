# Instructional demo guide

이 디렉터리의 컴포넌트는 게시글에서 설명하는 경고, 비효율 또는 안티패턴을 의도적으로 재현할 수 있다. `docs/adr/0002-protect-instructional-demos.md`를 따른다.

편집 전에 component 이름을 사용하는 한국어와 영어 게시글을 찾아 무엇을 관찰시키는 데모인지 확인한다. Lint 경고, effect, render 횟수, cache 동작과 느린 경로를 일반 제품 코드 기준으로 일괄 수정하지 않는다.

AI의 일괄 자동 수정은 이 디렉터리를 기본 제외한다. 사용자가 특정 데모 변경을 요청했을 때만 관련 글의 주장과 함께 좁게 수정한다. 데모의 경고나 동작을 바꾸면 게시글 설명과 browser 동작이 같은 결과를 말하는지 확인한다.

교육 데모 변경은 항상 `integrated` profile이다.

```sh
./scripts/verify.sh --profile integrated --stage quick
./scripts/verify.sh --profile integrated --stage final
```
