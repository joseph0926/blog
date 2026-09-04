import { getTranslations } from 'next-intl/server';
import { INFO } from '@/constants/info';
import type { AppLocale } from '@/i18n/routing';
import { AboutCover } from './about-cover';
import { AboutScrollProvider } from './about-scroll';
import { AboutStage } from './about-stage';
import { type Measurement, measureRatio } from './measure';
import { PinnedReel } from './pinned-reel';
import { type PrEntry, PrTabs } from './pr-tabs';
import { SectionReveal } from './section-reveal';

const careerIds = ['ea', 'nhn', 'pandora'] as const;

type CareerId = (typeof careerIds)[number];

type CareerEntry = {
  id: CareerId;
  period: string;
  company: string;
  role: string;
  highlight: string;
  details: string[];
};

const measurementIds = ['calls', 'prs', 'locales', 'publish'] as const;

const prSources = [
  {
    key: 'query-1',
    project: 'TanStack Query',
    id: '#8641',
    titleKey: 'openSource.groups.query.pr1Title',
    descKey: 'openSource.groups.query.pr1Desc',
  },
  {
    key: 'query-2',
    project: 'TanStack Query',
    id: '#9592',
    titleKey: 'openSource.groups.query.pr2Title',
    descKey: 'openSource.groups.query.pr2Desc',
  },
  {
    key: 'query-3',
    project: 'TanStack Query',
    id: '#9623',
    titleKey: 'openSource.groups.query.pr3Title',
    descKey: 'openSource.groups.query.pr3Desc',
  },
  {
    key: 'router-1',
    project: 'React Router',
    id: '#14286',
    titleKey: 'openSource.groups.router.pr1Title',
    descKey: 'openSource.groups.router.pr1Desc',
  },
  {
    key: 'router-2',
    project: 'React Router',
    id: '#14335',
    titleKey: 'openSource.groups.router.pr2Title',
    descKey: 'openSource.groups.router.pr2Desc',
  },
  {
    key: 'router-3',
    project: 'React Router',
    id: '#14534',
    titleKey: 'openSource.groups.router.pr3Title',
    descKey: 'openSource.groups.router.pr3Desc',
  },
  {
    key: 'router-4',
    project: 'React Router',
    id: '#14336',
    titleKey: 'openSource.groups.router.pr4Title',
    descKey: 'openSource.groups.router.pr4Desc',
  },
  {
    key: 'router-5',
    project: 'React Router',
    id: '#14687',
    titleKey: 'openSource.groups.router.pr5Title',
    descKey: 'openSource.groups.router.pr5Desc',
  },
  {
    key: 'rhf-1',
    project: 'React Hook Form',
    id: '#12865',
    titleKey: 'openSource.groups.rhf.pr1Title',
    descKey: 'openSource.groups.rhf.pr1Desc',
  },
  {
    key: 'tsr-1',
    project: 'TanStack Router',
    id: '#3611',
    titleKey: 'openSource.groups.tsr.pr1Title',
    descKey: 'openSource.groups.tsr.pr1Desc',
  },
] as const;

const sectionLabel = 'text-muted-foreground text-xs';
const sectionGrid =
  'grid gap-4 py-12 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10 lg:py-16';
const inkLink =
  'press text-foreground hover:text-accent-ink focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm underline decoration-rule decoration-1 underline-offset-[6px] transition-colors duration-150 hover:decoration-accent-ink focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none';

export async function AboutPageContent({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: 'about' });

  const career: CareerEntry[] = careerIds.map((id) => ({
    id,
    period: t(`experience.items.${id}.period`),
    company: t(`experience.items.${id}.company`),
    role: t(`experience.items.${id}.role`),
    highlight: t(`experience.items.${id}.highlight1`),
    details: [
      t(`experience.items.${id}.highlight2`),
      t(`experience.items.${id}.highlight3`),
    ],
  }));

  const prs: PrEntry[] = prSources.map(({ titleKey, descKey, ...pr }) => ({
    ...pr,
    title: t(titleKey),
    desc: t(descKey),
  }));

  const prGroups = [...new Set(prs.map((pr) => pr.project))].map((project) => ({
    project,
    countLabel: t('prCount', {
      count: prs.filter((pr) => pr.project === project).length,
    }),
  }));

  const measurements: Measurement[] = measurementIds.map((id) => ({
    id,
    from: t(`reel.items.${id}.from`),
    to: t(`reel.items.${id}.to`),
    caption: t(`reel.items.${id}.caption`),
    source: t(`reel.items.${id}.source`),
  }));

  const profileFacts = [
    { label: t('profileFacts.location'), value: t('meta.location') },
    { label: t('profileFacts.active'), value: t('meta.activeSince') },
    { label: t('profileFacts.openSource'), value: t('meta.openSourceTotal') },
    { label: t('profileFacts.stack'), value: t('profileFacts.stackValue') },
  ];

  const focusItems = [
    t('focus.items.developerExperience'),
    t('focus.items.reliableInterfaces'),
    t('focus.items.runtimeBehavior'),
    t('focus.items.openSource'),
  ];

  const stackGroups = [
    {
      label: t('stack.groups.core'),
      items: ['React', 'TypeScript', 'Next.js'],
    },
    {
      label: t('stack.groups.state'),
      items: ['TanStack Query', 'React Router', 'Zustand'],
    },
    {
      label: t('stack.groups.quality'),
      items: ['Vite', 'Vitest', 'Playwright', 'ESLint'],
    },
    {
      label: t('stack.groups.backend'),
      items: ['Node', 'Fastify', 'Prisma', 'tRPC'],
    },
  ];

  const connectLinks = [
    { href: INFO.GITHUB, label: 'GitHub' },
    { href: INFO.LINKEDIN, label: 'LinkedIn' },
    { href: 'mailto:joseph0926.dev@gmail.com', label: t('connect.email') },
  ];

  const ratios = measurements.map((item) => ({
    id: item.id,
    ratio: measureRatio(item.from, item.to),
  }));

  return (
    <AboutScrollProvider ratios={ratios}>
      <div className="relative isolate">
        <AboutStage />

        <AboutCover
          hint={t('coverHint')}
          name={t('profile.name')}
          role={t('profile.role')}
          scrollHint={t('scrollHint')}
          intro={t('intro')}
        />

        <PinnedReel label={t('reel.label')} items={measurements} />

        <div className="mx-auto max-w-[1260px] px-4">
          <SectionReveal className={sectionGrid}>
            <p className={sectionLabel}>{t('focus.heading')}</p>
            <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem]">
              <ul className="text-foreground space-y-3 text-base leading-7">
                {focusItems.map((item) => (
                  <li key={item} className="border-rule border-l-2 pl-4">
                    {item}
                  </li>
                ))}
              </ul>
              <dl className="grid content-start gap-4">
                {profileFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-muted-foreground text-xs">
                      {fact.label}
                    </dt>
                    <dd className="text-foreground mt-0.5 text-sm">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </SectionReveal>

          <SectionReveal
            aria-labelledby="about-career"
            className="py-12 lg:py-16"
          >
            <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
              <p className={sectionLabel}>{t('experience.eyebrow')}</p>
              <h2
                id="about-career"
                className="text-foreground text-xl font-semibold tracking-tight"
              >
                {t('experience.title')}
              </h2>
            </div>
            <ol className="mt-6">
              {career.map((entry, index) => (
                <li
                  key={entry.id}
                  className="border-rule grid gap-4 border-t py-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10"
                >
                  <div className="lg:sticky lg:top-20 lg:self-start">
                    <p className="text-muted-foreground font-mono text-xs tabular-nums">
                      {t('careerLabel')} {career.length - index}
                    </p>
                    <p className="text-foreground mt-1 font-mono text-sm tabular-nums">
                      {entry.period}
                    </p>
                  </div>
                  <div className="max-w-[68ch]">
                    <h3 className="text-foreground text-lg font-semibold tracking-tight">
                      {entry.company}
                      <span className="text-muted-foreground ml-3 text-base font-normal">
                        {entry.role}
                      </span>
                    </h3>
                    <p className="text-foreground mt-4 text-base leading-7 break-keep">
                      {entry.highlight}
                    </p>
                    <ul className="text-muted-foreground mt-4 space-y-2 text-sm leading-6">
                      {entry.details.map((detail) => (
                        <li
                          key={detail}
                          className="border-rule border-l-2 pl-4"
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </SectionReveal>

          <SectionReveal
            aria-labelledby="about-open-source"
            className="py-12 lg:py-16"
          >
            <div className="grid gap-4 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
              <p className={sectionLabel}>{t('openSource.eyebrow')}</p>
              <div>
                <h2
                  id="about-open-source"
                  className="text-foreground text-xl font-semibold tracking-tight"
                >
                  {t('openSource.heading')}
                </h2>
                <p className="text-muted-foreground mt-3 max-w-[62ch] text-sm leading-6">
                  {t('openSource.lead')}
                </p>
                <div className="mt-8">
                  <PrTabs prs={prs} groups={prGroups} />
                </div>
                <h3 className="text-muted-foreground mt-10 text-xs">
                  {t('openSource.projectsHeading')}
                </h3>
                <ul className="text-foreground mt-3 max-w-[68ch] space-y-3 text-sm leading-6 break-keep">
                  <li className="border-rule border-l-2 pl-4">
                    {t('openSource.firsttx')}
                  </li>
                  <li className="border-rule border-l-2 pl-4">
                    {t('openSource.mentoring')}
                  </li>
                </ul>
              </div>
            </div>
          </SectionReveal>

          <SectionReveal className={sectionGrid}>
            <p className={sectionLabel}>{t('stack.heading')}</p>
            <div>
              <p className="text-foreground max-w-[68ch] text-base leading-7">
                {t('stack.line')}
              </p>
              <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {stackGroups.map((group) => (
                  <div
                    key={group.label}
                    className="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)]"
                  >
                    <dt className="text-muted-foreground text-xs">
                      {group.label}
                    </dt>
                    <dd className="text-foreground text-sm">
                      {group.items.join(', ')}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </SectionReveal>

          <SectionReveal className={`${sectionGrid} border-rule border-b`}>
            <p className={sectionLabel}>{t('connect.heading')}</p>
            <div>
              <p className="text-foreground max-w-[62ch] text-base leading-7">
                {t('connect.description')}
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {connectLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith('mailto') ? undefined : '_blank'
                      }
                      rel={
                        link.href.startsWith('mailto')
                          ? undefined
                          : 'noopener noreferrer'
                      }
                      className={inkLink}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </SectionReveal>
        </div>
      </div>
    </AboutScrollProvider>
  );
}
