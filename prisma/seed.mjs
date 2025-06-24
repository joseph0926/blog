const dummyPosts = [
  {
    title: '2React Fiber',
    description: 'React v16부터 도입된 fiber에 대해서 알아봅니다.',
    tags: ['react'],
  },
  {
    title: '2React Suspense 이해하기',
    description:
      '데이터 패칭과 컴포넌트 로딩 흐름을 단순화하는 Suspense 개념을 살펴봅니다.',
    tags: ['react', 'suspense'],
  },
  {
    title: '2Server Components 소개',
    description:
      'React Server Components가 무엇인지, 언제 사용해야 하는지 설명합니다.',
    tags: ['react', 'server-components'],
  },
  {
    title: '2Next.js 14의 Streaming 렌더링',
    description:
      'Next.js 14에서 스트리밍 렌더링으로 첫 바이트 시간을 줄이는 방법을 다룹니다.',
    tags: ['nextjs', 'performance'],
  },
  {
    title: '2Web Vitals: INP 최적화 전략',
    description: 'INP(Input Delay) 메트릭의 의미와 최적화 방법을 정리합니다.',
    tags: ['performance', 'web-vitals'],
  },
  {
    title: '2React DevTools 고급 사용법',
    description:
      '컴포넌트 성능 병목을 찾기 위한 React DevTools 활용 팁을 공유합니다.',
    tags: ['react', 'devtools'],
  },
  {
    title: '2Zustand vs. Redux Toolkit',
    description: '두 상태 관리 라이브러리의 API·사용법·성능 차이를 비교합니다.',
    tags: ['state', 'zustand', 'redux'],
  },
  {
    title: '2Tailwind v4: CSS-first 접근',
    description:
      'Utility-first에서 CSS-first로 변화한 Tailwind v4의 핵심을 살펴봅니다.',
    tags: ['tailwind', 'css'],
  },
  {
    title: '2shadcn/ui 패턴 분석',
    description:
      'shadcn/ui가 왜 “내 코드”가 되는지, 컴포넌트 커스터마이징 흐름을 소개합니다.',
    tags: ['shadcn', 'ui'],
  },
  {
    title: '2Prisma + PostgreSQL 성능 튜닝',
    description:
      'Prisma ORM과 Postgres 인덱싱·쿼리 최적화를 통해 성능을 향상시키는 방법을 설명합니다.',
    tags: ['prisma', 'postgresql', 'database'],
  },
];

import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

async function main() {
  const postsDir = path.join(process.cwd(), 'src/mdx');
  await fs.mkdir(postsDir, { recursive: true });

  for (const post of dummyPosts) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const slugBase = generateSlug(post.title);
    const slug = `${dateStr}-${slugBase}`;
    const fileName = `${slug}.mdx`;

    const exists = await prisma.post.findUnique({ where: { slug } });
    if (exists) {
      console.log(`• 이미 있음: ${slug} — skip`);
      continue;
    }

    const frontmatter = `---
slug: "${slug}"
title: "${post.title}"
description: "${post.description}"
date: "${dateStr}"
tags: [${post.tags.map((t) => `"${t}"`).join(', ')}]
---\n
여기에 글을 작성하세요.
`;
    await fs.writeFile(path.join(postsDir, fileName), frontmatter, 'utf8');

    await prisma.post.create({
      data: {
        slug,
        title: post.title,
        description: post.description,
        tags: post.tags.map((t) => t.toLowerCase()),
      },
    });

    console.log(`✓ 생성됨: ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
