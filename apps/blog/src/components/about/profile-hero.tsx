'use client';

import { Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';

const socialLinks = [
  {
    icon: Github,
    href: 'https://github.com/joseph0926',
    label: 'GitHub',
  },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/in/joseph0926/',
    label: 'LinkedIn',
  },
  {
    icon: Mail,
    href: 'mailto:joseph0926.dev@gmail.com',
    label: 'Email',
  },
];

export const ProfileHero = () => {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="py-16 text-center md:py-24"
    >
      <motion.div variants={staggerItem}>
        <span className="border-border bg-muted/50 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          React Router · TanStack Query 컨트리뷰터
        </span>
      </motion.div>

      <motion.h1
        variants={staggerItem}
        className="text-foreground mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        김영훈
      </motion.h1>

      <motion.p
        variants={staggerItem}
        className="text-muted-foreground mt-4 text-xl md:text-2xl"
      >
        Frontend Engineer
      </motion.p>

      <motion.p
        variants={staggerItem}
        className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg"
      >
        React, TypeScript, Next.js 기반 프론트엔드 엔지니어입니다. 대규모 트래픽
        환경의 사용자 플로우 안정화, 성능 최적화, 레거시 마이그레이션에
        집중해왔습니다. TanStack Query·React Router 등 오픈소스에{' '}
        <strong className="text-foreground">
          10건 PR이 머지되어 공식 릴리스에 포함
        </strong>
        되었습니다.
      </motion.p>

      <motion.div
        variants={staggerItem}
        className="mt-8 flex items-center justify-center gap-4"
      >
        {socialLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground rounded-full border p-3 transition-colors duration-150"
          >
            <link.icon className="h-5 w-5" />
          </Link>
        ))}
      </motion.div>
    </motion.section>
  );
};
