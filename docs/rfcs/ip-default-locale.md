<!-- AI_STATUS: DRAFT -->

# RFC: IP 기반 기본 로케일 정책

- 작성일: 2026-02-21
- 상태: Draft (Q&A 반영)
- 대상 서비스: `apps/blog`

## 1) Summary

로케일 토글 조작이 없는 기본 진입에서, 방문자 IP 국가가 `KR`이면 `ko`, 그 외 국가는 `en`을 기본 로케일로 적용한다.

## 2) Background

현재 블로그는 `next-intl` 설정이 `defaultLocale: 'ko'`, `localeDetection: false`다.  
즉 브라우저 언어/`accept-language`와 무관하게 로케일 미지정 경로는 `ko`로 해석된다.

## 3) Goals

1. 기본 진입 로케일을 국가 기준으로 분기한다.
2. 로케일 토글 사용자의 명시적 선택은 우선 보장한다.
3. 기존 `/login`, `/admin` 보호 흐름은 변경하지 않는다.

## 4) Non-goals

1. 언어 자동 감지를 브라우저 언어 기반으로 확장하지 않는다.
2. 로케일 목록(`ko`, `en`) 자체는 변경하지 않는다.
3. 라우팅 prefix 정책(`as-needed`)은 변경하지 않는다.

## 5) Proposal

1. 로케일 미지정 경로에서만 기본 로케일 분기를 수행한다.
2. 분기 우선순위:
   - `NEXT_LOCALE` 쿠키가 유효하면 쿠키 우선
   - 쿠키가 없으면 IP 국가 헤더 기반 분기
3. IP 국가 헤더 우선순위:
   - `x-vercel-ip-country`
   - `cf-ipcountry`
4. 규칙:
   - `KR` -> `ko` (리다이렉트 없음)
   - `KR` 이외 -> `en` (동일 경로에 `/en` prefix 리다이렉트)
5. 예외 경로:
   - `/login`, `/admin*`는 기존 정책 유지

## 6) Risks / Edge Cases

1. 배포 환경에서 국가 헤더가 누락될 수 있다.
2. 헤더 누락 시 국가 판단이 불가하므로 기본값 `ko`를 사용한다.
3. CDN/프록시별 헤더 신뢰 정책이 다를 수 있다.

## 7) Acceptance Criteria

1. `KR` 요청 + 로케일 미지정 경로는 `ko`로 유지된다.
2. `KR` 외 요청 + 로케일 미지정 경로는 `/en/*`로 리다이렉트된다.
3. 토글로 저장된 `NEXT_LOCALE=ko` 상태에서는 비-KR에서도 `ko` 접근이 가능하다.
4. `/login`, `/admin*` 흐름은 기존과 동일하다.

## 8) Q&A 결정사항 (2026-02-21)

1. Q: 한국만 `ko`, 나머지는 `en`이 가능한가?  
   A: 가능하며 `proxy.ts`에서 분기한다.
2. Q: 기준은 무엇으로 할까?  
   A: IP 기준으로 확정한다.
