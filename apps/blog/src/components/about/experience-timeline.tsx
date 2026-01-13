'use client';

import { motion } from 'motion/react';
import { fadeInUp } from '@/lib/motion-variants';
import { SectionHeading } from '../ui/section-heading';

const experiences = [
  {
    company: 'EA Korea',
    role: 'Frontend Engineer — FC 온라인 운영툴',
    period: '2025.03 - 현재',
    tech: 'React, Zustand, TanStack Query, React Router, Zod, nuqs',
    highlights: [
      'URL 상태 동기화로 QA 재현/로그 요청 문의 주간 10→3건 감소',
      '아이템 버전 관리 플로우 재설계 후 동일 유형 배포 이슈 0건',
      '운영툴 프론트엔드 전반 1인 담당 (스택 선정 ~ QA 협업 ~ 문서화)',
    ],
  },
  {
    company: 'NHN Injeinc',
    role: 'Frontend Engineer — 티켓링크',
    period: '2024.05 - 2025.03',
    tech: 'React, Zustand, TanStack Query, React Router, i18next',
    highlights: [
      'KBO 개막전, 한국시리즈 등 대규모 트래픽 예매 플로우 개발',
      'JSP 기반 다국어 페이지를 React + i18next 단일 코드베이스로 통합(2→1)',
      '팬클럽 등급 × 구단 정책 필터링으로 비대상 유저 플로우 진입 차단',
    ],
  },
  {
    company: '판도라티비',
    role: 'Frontend Engineer — 코박(암호화폐 커뮤니티)',
    period: '2023.07 - 2024.05',
    tech: 'React, Redux Toolkit, React Query, Next.js, Framer Motion, EJS',
    highlights: [
      'Lighthouse SEO 점수 56→82 개선 (EJS 템플릿 동적 메타 주입)',
      '하이브리드 앱 WebView 개발 (커뮤니티 + 상품 구매 플로우)',
      '@멘션 기능 제안 및 구현 (알림 연동까지 end-to-end)',
    ],
  },
];

export const ExperienceTimeline = () => {
  return (
    <section className="py-16">
      <SectionHeading title="Experience" description="Work history" />

      <div className="space-y-10">
        {experiences.map((exp, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="border-border relative border-l-2 pl-6"
          >
            <span className="border-foreground bg-background absolute top-0 -left-[9px] h-4 w-4 rounded-full border-2" />
            <div className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-foreground text-lg font-semibold">
                  {exp.company}
                </h3>
                <span className="text-muted-foreground text-sm">
                  {exp.period}
                </span>
              </div>
              <p className="text-foreground text-sm font-medium">{exp.role}</p>
              <p className="text-muted-foreground text-xs">{exp.tech}</p>
              <ul className="mt-2 space-y-1.5">
                {exp.highlights.map((item, i) => (
                  <li
                    key={i}
                    className="text-muted-foreground flex items-start gap-2 text-sm"
                  >
                    <span className="bg-muted-foreground/50 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
