'use client';

import { motion } from 'motion/react';
import { staggerContainer, staggerItem } from '@/lib/motion-variants';
import { SectionHeading } from '../ui/section-heading';

const skillCategories = [
  {
    title: 'Core',
    skills: ['React', 'TypeScript', 'Next.js'],
  },
  {
    title: 'State/Data',
    skills: ['TanStack Query', 'Zustand', 'React Router'],
  },
  {
    title: 'Build/Test',
    skills: ['Vite', 'Vitest', 'Playwright', 'ESLint'],
  },
  {
    title: 'Backend',
    skills: ['Node.js', 'Express', 'Fastify', 'Prisma', 'tRPC'],
  },
];

export const SkillsGrid = () => {
  return (
    <section className="py-16">
      <SectionHeading title="Skills" description="Tech stack" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="grid gap-6 sm:grid-cols-2"
      >
        {skillCategories.map((category) => (
          <motion.div
            key={category.title}
            variants={staggerItem}
            className="border-border bg-card rounded-lg border p-5"
          >
            <h3 className="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="border-border bg-muted/50 text-foreground rounded-full border px-3 py-1 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
