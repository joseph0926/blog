'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import {
  springHover,
  staggerContainer,
  staggerItem,
} from '@/lib/motion-variants';
import { SectionHeading } from '../ui/section-heading';

export const OpenSourceSection = () => {
  const t = useTranslations('about.openSource');
  const contributionGroups = [
    {
      project: 'TanStack Query',
      url: 'https://github.com/TanStack/query',
      prs: [
        {
          title: t('groups.query.pr1Title'),
          pr: '#8641',
          desc: t('groups.query.pr1Desc'),
        },
        {
          title: t('groups.query.pr2Title'),
          pr: '#9592',
          desc: t('groups.query.pr2Desc'),
        },
        {
          title: t('groups.query.pr3Title'),
          pr: '#9623',
          desc: t('groups.query.pr3Desc'),
        },
      ],
    },
    {
      project: 'React Router',
      url: 'https://github.com/remix-run/react-router',
      prs: [
        {
          title: t('groups.router.pr1Title'),
          pr: '#14286',
          desc: t('groups.router.pr1Desc'),
        },
        {
          title: t('groups.router.pr2Title'),
          pr: '#14335',
          desc: t('groups.router.pr2Desc'),
        },
        {
          title: t('groups.router.pr3Title'),
          pr: '#14534',
          desc: t('groups.router.pr3Desc'),
        },
        {
          title: t('groups.router.pr4Title'),
          pr: '#14269',
          desc: t('groups.router.pr4Desc'),
        },
        {
          title: t('groups.router.pr5Title'),
          pr: '#14687',
          desc: t('groups.router.pr5Desc'),
        },
      ],
    },
    {
      project: 'React Hook Form',
      url: 'https://github.com/react-hook-form/react-hook-form',
      prs: [
        {
          title: t('groups.rhf.pr1Title'),
          pr: '#13150',
          desc: t('groups.rhf.pr1Desc'),
        },
      ],
    },
    {
      project: 'TanStack Router',
      url: 'https://github.com/TanStack/router',
      prs: [
        {
          title: t('groups.tsr.pr1Title'),
          pr: '#5864',
          desc: t('groups.tsr.pr1Desc'),
        },
      ],
    },
  ];

  return (
    <section className="py-16">
      <SectionHeading title={t('title')} description={t('description')} />

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
                {t('github')}
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
                    {t('merged')}
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
