# about 페이지는 스크롤에 스크럽되는 모션을 허용한다

[ADR 0004](0004-visual-direction-lab-ledger.md)의 시각 체계(종이와 잉크 두 톤, accent 하나, 괘선 구획, 카드와 그림자와 blur 금지, IBM Plex 서체 규칙)는 그대로 유지하되, about 페이지에 한해 모션 예산을 "스크롤 위치에 스크럽되는 모션"까지 넓힌다. 이 ADR은 0004의 about 문단을 대체하고, 나머지 페이지의 모션 예산은 바꾸지 않는다.

허용하는 것은 스크롤 진행값에 1:1로 묶여 사용자가 되감을 수 있는 변화다. 표지 제목이 스크롤을 따라 축소되어 왼쪽 여백 색인에 자리를 넘기는 것, 소개문이 고정 화면 안에서 단어 단위로 잉크가 배듯 드러나는 것, 측정 숫자가 진행값으로 세어지는 것, 경력 여백의 괘선이 진행값만큼 그려지고 각 장의 상세가 진행값만큼 열리는 것, 오픈소스 PR이 고정 화면에서 종이 낱장처럼 쌓이는 것, 표지의 괘선 무대가 연락 장에서 다시 떠오르는 것이 여기에 속한다. 도구 이름 marquee는 장식이며 스크롤 속도에 따라 가속하고 `aria-hidden`으로 둔다. 스크롤 자체는 `lenis`로 부드럽게 만들며, about 밖에는 적용하지 않는다.

금지는 유지한다. 시간 기반 진입 fade-up, stagger, 컨테이너의 opacity 0 시작은 계속 넣지 않는다. WebGL과 three.js, GSAP, 글로우와 그라디언트 배경은 빌리지 않는다. 외부 reference(reactbits, aceternity, magicui, smoothui, beui)에서 빌린 것은 sticky reveal, tracing beam, 단어 스크럽, number ticker, 속도 marquee, sheet stack이라는 동작 관계뿐이고 검은 배경과 카드 표현은 빌리지 않았다.

본문은 JS 실행 전과 `prefers-reduced-motion`에서 정적 DOM으로 완전히 읽혀야 한다. 스크럽 컴포넌트는 마운트 전과 저감 모드에서 같은 내용을 고정 없이 정적으로 렌더하고, 저감 모드에서는 이동과 스크럽만 제거하며 위치, 상태, 색 정보는 남긴다. `lenis`는 `respectReducedMotion` 옵션으로 저감 모드에서 스크롤 보간을 끈다. 스크럽 값은 `useTransform(progress, transform(inputs, outputs))`처럼 함수형으로 만든다. Motion 12.40은 배열형 `useTransform`을 opacity와 transform에 적용하면 WAAPI ScrollTimeline으로 가속하는데, sticky 자식을 가진 target에서는 그 값이 JS 진행값과 어긋나 항목이 겹쳐 보였다.

자동 검사는 정적 검사, 두 locale에서 저감 모드로 헤딩과 측정, 경력 내용이 텍스트로 존재하는지 확인하는 E2E까지다. 미감, pacing, 좁은 화면의 시각 붕괴는 사람이 실제 화면에서 판정한다.
