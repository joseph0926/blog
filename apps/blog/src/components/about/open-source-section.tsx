'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import {
  springHover,
  staggerContainer,
  staggerItem,
} from '@/lib/motion-variants';
import { SectionHeading } from '../ui/section-heading';

const contributionGroups = [
  {
    project: 'TanStack Query',
    url: 'https://github.com/TanStack/query',
    prs: [
      {
        title: 'useQueries O(N²) → O(N) 최적화',
        pr: '#8641',
        desc: '500 queries 벤치마크 함수 호출 수 4,500→2,000 (약 -55%)',
      },
      {
        title: 'persist + memoized combine 버그 수정',
        pr: '#9592',
        desc: '새로고침 후 UI 미갱신 문제 해결',
      },
      {
        title: 'CI 타임아웃 수정',
        pr: '#9623',
        desc: 'Nx Cloud 분산 실행 설정 불일치 안정화',
      },
    ],
  },
  {
    project: 'React Router',
    url: 'https://github.com/remix-run/react-router',
    prs: [
      {
        title: 'middleware skipRevalidation 누락 수정',
        pr: '#14286',
        desc: '부모 loader 불필요 재실행 해결',
      },
      {
        title: '브라우저 스토리지 제한 환경 대응',
        pr: '#14335',
        desc: '시크릿 모드 세션 저장 실패 안전 처리',
      },
      {
        title: 'fetcher.submit JSON 버그 수정',
        pr: '#14534',
        desc: 'SSR 환경 회귀 테스트 추가',
      },
      {
        title: 'generatePath suffix 파라미터 수정',
        pr: '#14269',
        desc: ':id.json 경로 생성 실패 해결',
      },
      {
        title: '<Links /> crossOrigin 속성 추가',
        pr: '#14687',
        desc: 'CDN CORS CSS preload 이슈 대응',
      },
    ],
  },
  {
    project: 'React Hook Form',
    url: 'https://github.com/react-hook-form/react-hook-form',
    prs: [
      {
        title: 'useController 타입 회귀 수정',
        pr: '#13150',
        desc: 'never 고정 문제 + 타입 테스트 추가',
      },
    ],
  },
  {
    project: 'TanStack Router',
    url: 'https://github.com/TanStack/router',
    prs: [
      {
        title: 'params.parse notFound() 처리 수정',
        pr: '#5864',
        desc: '500→404 수정 + 테스트 추가',
      },
    ],
  },
];

export const OpenSourceSection = () => {
  return (
    <section className="py-16">
      <SectionHeading
        title="Open Source"
        description="10 PRs merged to official releases"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="space-y-6"
      >
        {contributionGroups.map((group) => (
          <motion.div
            key={group.project}
            variants={staggerItem}
            className="border-border bg-card rounded-lg border p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground font-semibold">{group.project}</h3>
              <a
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
            <ul className="space-y-3">
              {group.prs.map((pr) => (
                <motion.li
                  key={pr.pr}
                  variants={springHover}
                  whileHover="hover"
                  className="hover:bg-muted/50 flex items-start gap-3 rounded-md p-2 transition-colors"
                >
                  <span className="shrink-0 rounded bg-green-500/10 px-1.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                    Merged
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">
                      {pr.title}{' '}
                      <span className="text-muted-foreground">({pr.pr})</span>
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {pr.desc}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
