<!-- AI_STATUS: DRAFT -->

# Plan: IP 기반 기본 로케일 정책

- 작성일: 2026-02-21
- 상태: Draft (Q&A 반영)
- 대상 서비스: `apps/blog`

## 1) 실행 단계

1. `proxy.ts`에 국가 코드 추출 유틸을 추가한다.
2. 로케일 미지정 경로에서만 `en` 리다이렉트 선분기를 수행한다.
3. 로케일 토글 지속성을 위해 `NEXT_LOCALE` 쿠키를 우선 적용한다.
4. 기존 예외(`/login`, `/admin*`, `/en/admin*`, `/en/login`) 동작을 유지한다.
5. lint / type-check / test를 실행해 회귀를 확인한다.
6. 구현 결과와 근거를 `docs/impl/ip-default-locale.md`에 기록한다.

## 2) 상세 설계

1. 국가 코드 소스:
   - `x-vercel-ip-country`
   - `cf-ipcountry`
2. 기본 분기:
   - `country === 'KR'` -> `ko`
   - 그 외 -> `en`
3. 토글 우선순위:
   - `NEXT_LOCALE`이 `ko|en`이면 국가 분기보다 우선한다.
4. 리다이렉트 경로:
   - `/` -> `/en`
   - `/blog` -> `/en/blog`
   - 쿼리스트링은 보존

## 3) 리스크/엣지 케이스

1. 국가 헤더 누락 시 기본값 `ko`가 적용된다.
2. `as-needed` prefix 정책상 `ko`는 무 prefix여서, 토글 쿠키를 고려하지 않으면 비-KR 사용자의 `ko` 유지가 깨질 수 있다.
3. `/admin` 인증 분기보다 앞에서 리다이렉트하면 보안 흐름이 바뀔 수 있으므로 기존 순서를 유지한다.

## 4) Verification Commands

1. `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog lint`
2. `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog type-check`
3. `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog test:ci`

## 5) Q&A 결정사항 (2026-02-21)

1. Q: 한국만 `ko`, 나머지는 `en`으로 할 수 있나?  
   A: 가능하다.
2. Q: 국가 판별 기준은?  
   A: IP 기준으로 확정.
