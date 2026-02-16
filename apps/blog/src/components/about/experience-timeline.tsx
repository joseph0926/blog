'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { fadeInUp } from '@/lib/motion-variants';
import { SectionHeading } from '../ui/section-heading';

export const ExperienceTimeline = () => {
  const t = useTranslations('about.experience');
  const experiences = [
    {
      company: t('items.ea.company'),
      role: t('items.ea.role'),
      period: t('items.ea.period'),
      tech: 'React, Zustand, TanStack Query, React Router, Zod, nuqs',
      highlights: [
        t('items.ea.highlight1'),
        t('items.ea.highlight2'),
        t('items.ea.highlight3'),
      ],
    },
    {
      company: t('items.nhn.company'),
      role: t('items.nhn.role'),
      period: t('items.nhn.period'),
      tech: 'React, Zustand, TanStack Query, React Router, i18next',
      highlights: [
        t('items.nhn.highlight1'),
        t('items.nhn.highlight2'),
        t('items.nhn.highlight3'),
      ],
    },
    {
      company: t('items.pandora.company'),
      role: t('items.pandora.role'),
      period: t('items.pandora.period'),
      tech: 'React, Redux Toolkit, React Query, Next.js, Framer Motion, EJS',
      highlights: [
        t('items.pandora.highlight1'),
        t('items.pandora.highlight2'),
        t('items.pandora.highlight3'),
      ],
    },
  ];

  return (
    <section className="py-16">
      <SectionHeading title={t('title')} description={t('description')} />

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
