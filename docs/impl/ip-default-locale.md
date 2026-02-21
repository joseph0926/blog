<!-- AI_STATUS: DRAFT -->

# Implementation: IP 기반 기본 로케일 정책

- 작성일: 2026-02-21
- 상태: Draft (Q&A 반영)
- 대상 서비스: `apps/blog`

## 1) 구현 요약

`proxy.ts`에 기본 로케일 선분기 로직을 추가해, 로케일 미지정 경로에서 `KR -> ko`, `KR 외 -> en`이 적용되도록 변경했다.  
단, 로케일 토글 지속성을 위해 `NEXT_LOCALE` 쿠키를 국가 판별보다 우선한다.

## 2) 변경 파일

1. `apps/blog/src/proxy.ts`
   - `x-vercel-ip-country`, `cf-ipcountry` 기반 국가 코드 추출 함수 추가
   - `NEXT_LOCALE` 쿠키 파싱 함수 추가
   - `/login`, `/admin*`, locale prefix 경로를 제외한 기본 분기 로직 추가
   - 비-KR 기본 진입 시 `/en` prefix 리다이렉트(+쿼리스트링 보존)
2. `docs/rfcs/ip-default-locale.md`
3. `docs/plan/ip-default-locale.md`
4. `docs/impl/ip-default-locale.md`

## 3) 구현 근거 (대안 대비)

1. 선택안: `proxy.ts` 선분기
   - 이유: 현재 로케일 결정의 진입점이 `next-intl` middleware(proxy)라서 최소 변경으로 적용 가능
2. 대안 1: `defaultLocale`를 `en`으로 변경 후 KR만 예외 처리
   - 미채택 이유: 기존 `ko` canonical 경로/SEO/내부 링크 정책 영향 범위가 커짐
3. 대안 2: `localeDetection: true`로 전환
   - 미채택 이유: 요구사항이 브라우저 언어가 아니라 IP 기준이며, 기존 동작 변화가 큼

## 4) 리스크/엣지 케이스

1. 국가 헤더가 없는 환경에서는 기본값 `ko`로 fallback된다.
2. 배포 환경에 따라 국가 헤더 정확도가 다를 수 있다.
3. `/admin` 인증 분기 이전에 동작하지 않도록 기존 보호 로직 순서를 유지했다.

## 5) Verification

1. `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog lint`
   - 결과: 통과(경고 2건은 기존 파일 `src/lib/perf-log.ts`의 unused var)
2. `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog type-check`
   - 결과: 통과
3. `/Users/kimyounghoon/Library/pnpm/pnpm --filter @joseph0926/blog test:ci`
   - 결과: 통과 (3 files, 12 tests)

## 6) Q&A 결정사항 (2026-02-21)

1. Q: 한국만 `ko`, 나머지는 `en`으로 가능한가?  
   A: 가능.
2. Q: 국가 판별 기준은?  
   A: IP 기준으로 확정.
