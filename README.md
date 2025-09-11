# 개인 기술 블로그

<img width="1470" height="666" alt="blog_readme" src="https://github.com/user-attachments/assets/a04314f1-596d-4a05-ac67-3c4f0bc05ce6" />

![kyh-blog](https://github.com/user-attachments/assets/57fed4a0-fd95-4724-b4c7-21cc73f9756b)

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 구조

```sh
.
├── components.json
├── docker-compose.test.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prisma
│   └── schema.prisma
├── public
│   ├── content
│   │   ├── query-1.png
│   │   └── query-2.png
│   └── logo
│       ├── logo.svg
│       └── logo.webp
├── README.md
├── scripts
├── src
│   ├── __tests__
│   │   ├── lib
│   │   ├── server
│   │   │   └── trpc
│   │   │       └── routers
│   │   └── services
│   │       └── post
│   ├── app
│   │   ├── (auth)
│   │   │   └── login
│   │   ├── (root)
│   │   │   └── about
│   │   ├── admin
│   │   ├── api
│   │   │   ├── revalidate
│   │   │   ├── trpc
│   │   │   │   └── [trpc]
│   │   │   └── upload
│   │   ├── blog
│   │   ├── globals.css
│   │   └── post
│   │       └── [slug]
│   ├── components
│   │   ├── about
│   │   ├── admin
│   │   ├── blog
│   │   ├── home
│   │   ├── layouts
│   │   ├── loading
│   │   ├── post
│   │   └── ui
│   ├── constants
│   ├── hooks
│   ├── lib
│   │   └── auth
│   ├── mdx
│   │   └── components
│   │       ├── cache
│   │       ├── fiber
│   │       ├── react-query
│   │       ├── sonner
│   │       └── suspense
│   ├── meta
│   ├── providers
│   ├── schemas
│   ├── server
│   │   └── trpc
│   │       └── routers
│   ├── services
│   │   └── post
│   ├── test
│   └── types
├── tsconfig.json
└── tsconfig.tsbuildinfo
```

## 실행

```sh
# 빌드
pnpm build
# 실행
pnpm dev # localhost:3000

# 체크
pnpm lint
pnpm format
pnpm type-check

# 테스트
pnpm test
pnpm test:ci
pnpm test:ui
pnpm test:coverage

# DB
pnpm db:gen
pnpm db:push
pnpm db:re # reset
pnpm db:stu # studio
pnpm db:test:push
```

## env

```sh
# main .env
APP_ENV=

CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_CLOUD_NAME=

VERCEL_ENV=

DATABASE_URL= #psql

# test .env
NEXT_PUBLIC_APP_ENV=
DATABASE_URL=
JWT_SECRET=
VERCEL_ENV=
```

## 이후 변경 예정

- 모노레포 구조로 변경
  - [PR #11](https://github.com/joseph0926/blog/pull/11)

## 연락

Email: joseph0926.dev@gmail.com
