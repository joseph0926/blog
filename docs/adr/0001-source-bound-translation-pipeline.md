# 원문에 결속된 번역 파이프라인을 요구한다

새 영어 번역이나 변경된 한국어 원문의 번역은 Codex 또는 Claude Code가 작성하고, 마지막 단계에서만 `anti-slop-english`로 검수한 뒤, 영어 frontmatter에 현재 한국어 MDX 원문의 SHA-256을 `sourceHash`로 기록해야 완료된다. 공개 저장소에는 AI 도구 이름이나 검수 metadata를 남기지 않고 검수 결과는 해당 작업의 최종 응답에서만 보고한다. 기존 번역은 [content hash legacy baseline](0003-content-hash-legacy-baseline.md)과 현재 bytes가 일치할 때만 hash 없는 legacy 경고로 허용하며 어느 쪽 파일이든 달라지면 새 계약으로 전환한다. 번역 시간과 공유 skill 의존성이 늘어나더라도 오래된 번역과 검수되지 않은 AI 문체를 막기 위한 선택이며, 새 계약으로 전환된 글의 의미 이탈이나 누락되거나 오래된 hash는 완료를 차단한다.
