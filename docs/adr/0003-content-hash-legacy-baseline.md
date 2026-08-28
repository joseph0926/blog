# Git diff 대신 content hash legacy baseline을 사용한다

기존 콘텐츠 결함을 잠시 허용하면서 새 결함과 수정된 legacy 파일에는 현재 계약을 강제한다. 허용 대상은 `apps/blog/scripts/content-legacy-baseline.json`에 경로와 현재 파일 SHA-256으로 기록한다. `sourceHash` 누락은 한국어 원문과 영어 번역본의 hash를 함께 결속하고, slug 불일치는 해당 파일 hash와 expected와 actual 값을 결속한다.

Validator는 Git working tree나 workflow event를 읽지 않고 전체 MDX corpus와 baseline을 비교한다. 새 violation, fingerprint 불일치, 잘못된 schema와 해결 뒤 남은 stale entry는 오류다. 이 방식은 local, clean CI checkout, push, pull request와 수동 실행에서 같은 현재 상태를 판정한다.

Event별 Git diff는 pull request, push, shallow checkout과 수동 실행마다 revision 계약이 달라지므로 선택하지 않았다. GitHub path filter와 compare API는 누락 한계가 있어 correctness sensor로 쓰지 않고, 외부 changed-file Action은 같은 판정을 위해 새 공급망 표면을 추가하므로 사용하지 않는다. 기존 결함의 일괄 수정은 번역 검수와 공개 slug 변경을 CI 개선에 섞으므로 별도 작업으로 남긴다.

Baseline 자동 생성이나 갱신 명령은 제공하지 않는다. 새 entry는 사람이 승인한 debt 변경이고, 기존 결함을 해결할 때 entry를 제거한다. 두 배열이 모두 비면 전역 strict validation으로 전환하고 baseline mechanism과 이 ADR을 은퇴 대상으로 검토한다.
