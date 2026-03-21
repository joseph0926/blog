# Task: Admin 코드 삭제 + 사이드이펙트 수정

Status: completed
Created: 2026-03-21

## Scope

DELETE:

- src/app/admin/ (dir)
- src/app/(auth)/ (dir)
- src/components/admin/ (dir)
- src/lib/auth/ (dir)
- src/lib/upload.ts
- src/server/trpc/routers/auth.ts
- src/app/api/upload/route.ts
- src/app/api/revalidate/route.ts

MODIFY:

- src/server/trpc/root.ts — authRouter 제거
- src/server/trpc/trpc.ts — protectedProcedure/isAuth 제거
- src/server/trpc/context.ts — auth 로직 제거
- src/server/trpc/routers/post.ts — createPost/update 프로시저 제거
- src/proxy.ts — admin/login 라우팅 제거
- src/meta/robots.ts — admin/auth 항목 제거
- src/app/robots.ts — /admin/ disallow 제거
- src/mdx/components/mdx-link.tsx — admin/login 제외 조건 제거
- prisma/schema.prisma — User/RefreshToken 삭제
- .env, .env.test — auth 환경변수 제거
- docs/architecture.md, docs/testing.md — admin/auth 언급 제거

## Steps

- [x] 1. 디렉토리/파일 삭제 (8개)
- [x] 2. tRPC 수정 (root.ts, trpc.ts, context.ts, post.ts)
- [x] 3. proxy.ts 정리
- [x] 4. 기타 참조 정리 (robots, meta, mdx-link)
- [x] 5. 환경변수 정리 (.env, .env.test)
- [x] 6. Prisma 스키마 수정 + db:gen
- [x] 7. 문서 업데이트 (architecture.md, testing.md)
- [x] 8. verify.sh 실행

## Acceptance Criteria

- [x] 삭제된 파일/디렉토리 미존재
- [x] TypeScript 타입 에러 없음
- [x] 기존 30개 테스트 전부 통과
- [x] 빌드 성공
- [x] verify.sh 통과

## Notes

- .next/types/ 캐시에 삭제된 라우트 참조가 남아 타입 에러 발생 → rm -rf .next/types로 해결
- revalidateTag import가 createPost/update 프로시저 삭제 후 미사용 → import 제거
