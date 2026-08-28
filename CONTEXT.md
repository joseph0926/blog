# Blog Delivery

MDX로 작성한 기술 글과 이를 제공하는 웹 애플리케이션을 함께 운영하는 context다. 콘텐츠와 실행 코드가 맞물리는 변경을 구분해 안전하게 전달하기 위해 존재한다.

## Language

**제품 코드 작업 (Product Code Work)**:
웹 애플리케이션, 공유 UI, 서버 API와 빌드·검증 기반을 변경하는 작업이다. 게시할 글 자체가 주된 산출물인 작업은 포함하지 않는다.
_Avoid_: 일반 코드 작업, 앱 작업

**콘텐츠 작업 (Content Work)**:
게시글의 frontmatter, 본문, 번역과 글에 포함되는 정적 자산을 변경하는 작업이다. 실행되는 교육 데모를 바꾸는 작업은 이것만으로 분류하지 않는다.
_Avoid_: MDX 작업, 글 작업

**통합 작업 (Integrated Work)**:
제품 코드와 콘텐츠 계약을 함께 변경해 두 영역의 검증이 모두 필요한 작업이다.
_Avoid_: 혼합 작업, 전체 작업

**교육 데모 (Instructional Demo)**:
게시글의 설명을 독자가 직접 관찰할 수 있도록 MDX에서 실행하는 컴포넌트다. 설명 대상인 경고, 비효율 또는 안티패턴을 의도적으로 포함할 수 있다.
_Avoid_: 일반 UI 컴포넌트, 예제 코드

**원문 (Source Post)**:
게시글의 의미와 변경 기준을 소유하는 한국어 locale variant다.
_Avoid_: 한국어판, 기본 글

**번역본 (Translation)**:
원문의 의미를 영어로 제공하며 원문이 바뀌면 자동으로 동기화되는 locale variant다.
_Avoid_: 영어판, 보조 글

**번역 파이프라인 (Translation Pipeline)**:
Codex 또는 Claude Code가 원문을 영어로 옮긴 뒤 `anti-slop-english`로 의미 보존과 자연스러운 문체를 최종 검수하는 전달 과정이다. 두 단계가 모두 끝나야 번역 동기화가 완료된다.
_Avoid_: 자동 번역, 영어 윤문
