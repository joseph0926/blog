# 개인 기술 블로그

<img width="1470" height="666" alt="blog_readme" src="https://github.com/user-attachments/assets/a04314f1-596d-4a05-ac67-3c4f0bc05ce6" />

![kyh-blog](https://github.com/user-attachments/assets/57fed4a0-fd95-4724-b4c7-21cc73f9756b)

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 구조

```sh
.
├── apps
│   ├── blog
│   │   ├── components.json
│   │   ├── docker-compose.test.yml
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── prisma
│   │   │   └── schema.prisma
│   │   ├── public
│   │   │   ├── content
│   │   │   │   ├── query-1.png
│   │   │   │   └── query-2.png
│   │   │   └── logo
│   │   │       ├── logo.svg
│   │   │       └── logo.webp
│   │   ├── src
│   │   │   ├── __tests__
│   │   │   │   ├── lib
│   │   │   │   ├── server
│   │   │   │   │   └── trpc
│   │   │   │   │       └── routers
│   │   │   │   └── services
│   │   │   │       └── post
│   │   │   ├── app
│   │   │   │   ├── (auth)
│   │   │   │   │   └── login
│   │   │   │   ├── (root)
│   │   │   │   │   └── about
│   │   │   │   ├── admin
│   │   │   │   ├── api
│   │   │   │   │   ├── revalidate
│   │   │   │   │   ├── trpc
│   │   │   │   │   │   └── [trpc]
│   │   │   │   │   └── upload
│   │   │   │   ├── blog
│   │   │   │   └── post
│   │   │   │       └── [slug]
│   │   │   ├── components
│   │   │   │   ├── about
│   │   │   │   ├── admin
│   │   │   │   ├── blog
│   │   │   │   ├── home
│   │   │   │   ├── layouts
│   │   │   │   ├── loading
│   │   │   │   ├── post
│   │   │   │   └── ui
│   │   │   ├── constants
│   │   │   ├── hooks
│   │   │   ├── lib
│   │   │   │   └── auth
│   │   │   ├── mdx
│   │   │   │   └── components
│   │   │   │       ├── cache
│   │   │   │       ├── fiber
│   │   │   │       ├── react-query
│   │   │   │       ├── sonner
│   │   │   │       └── suspense
│   │   │   ├── meta
│   │   │   ├── providers
│   │   │   ├── schemas
│   │   │   ├── server
│   │   │   │   └── trpc
│   │   │   │       └── routers
│   │   │   ├── services
│   │   │   │   └── post
│   │   │   ├── test
│   │   │   └── types
│   │   ├── tsconfig.json
│   │   └── tsconfig.tsbuildinfo
├── eslint.config.mjs
├── package.json
├── packages
│   └── ui
│       ├── components
│       ├── components.json
│       ├── lib
│       ├── package.json
│       ├── styles
│       │   └── globals.css
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prettier.config.mjs
├── README.md
└── turbo.json
```

## 실행

```sh
# 빌드
pnpm build
# 실행
pnpm dev
# blog(next.js): localhost:3000

# 체크
pnpm lint:fix
pnpm format
pnpm type-check

# DB
pnpm db:gen
```

## env

```sh
# main .env
NEXT_PUBLIC_APP_ENV=
VERCEL_ENV=
APP_VERSION=

# test .env
NEXT_PUBLIC_APP_ENV=
VERCEL_ENV=
```

## 연락

Email: joseph0926.dev@gmail.com
