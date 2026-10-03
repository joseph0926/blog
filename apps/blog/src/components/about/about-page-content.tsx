import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SectionDial } from '@/components/dial/section-dial';
import { INFO } from '@/constants/info';
import type { AppLocale } from '@/i18n/routing';
import { type Measurement, MeasureReel } from './measure-reel';

const careerIds = ['ea', 'nhn', 'pandora'] as const;

const measurementIds = ['calls', 'prs', 'booking', 'verification'] as const;

const prSources = [
  {
    key: 'query-1',
    project: 'TanStack Query',
    id: '#8641',
    titleKey: 'openSource.groups.query.pr1Title',
    descKey: 'openSource.groups.query.pr1Desc',
  },
  {
    key: 'router-3',
    project: 'React Router',
    id: '#14534',
    titleKey: 'openSource.groups.router.pr3Title',
    descKey: 'openSource.groups.router.pr3Desc',
  },
  {
    key: 'router-5',
    project: 'React Router',
    id: '#14687',
    titleKey: 'openSource.groups.router.pr5Title',
    descKey: 'openSource.groups.router.pr5Desc',
  },
] as const;

const chapterIds = {
  intro: 'about-intro',
  measurements: 'measurements',
  focus: 'about-focus',
  career: 'about-career',
  openSource: 'about-open-source',
  stack: 'about-stack',
  connect: 'about-connect',
} as const;

function Chapter({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="pt-28">
      <h2
        id={`${id}-heading`}
        className="text-foreground font-serif text-[2rem] leading-[1.25] font-semibold tracking-[-0.025em]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * about은 노트의 표지다 (ADR 0006). 왼쪽 여백의 장 다이얼이 글 상세와 같은 규칙으로 돌고,
 * 작업 기록은 홈 질문 다이얼과 같은 릴로 한 건씩 가운데에 온다. 나머지 장은 움직이지 않는다.
 */
export async function AboutPageContent({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: 'about' });

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

  const career = careerIds.map((id) => ({
    id,
    period: t(`experience.items.${id}.period`),
    company: t(`experience.items.${id}.company`),
    role: t(`experience.items.${id}.role`),
    paragraphs: [
      t(`experience.items.${id}.highlight1`),
      t(`experience.items.${id}.highlight2`),
      t(`experience.items.${id}.highlight3`),
    ],
  }));

  const prs = prSources.map(({ titleKey, descKey, ...pr }) => ({
    ...pr,
    title: t(titleKey),
    desc: t(descKey),
  }));

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

  const chapters = [
    { id: chapterIds.intro, label: t('index.intro') },
    { id: chapterIds.measurements, label: t('reel.label') },
    { id: chapterIds.focus, label: t('focus.heading') },
    { id: chapterIds.career, label: t('experience.title') },
    { id: chapterIds.openSource, label: t('openSource.heading') },
    { id: chapterIds.stack, label: t('stack.heading') },
    { id: chapterIds.connect, label: t('connect.heading') },
  ];

  return (
    <div className="mx-auto max-w-[1260px] px-4 pb-32">
      <section
        aria-labelledby="about-cover-title"
        className="flex min-h-[calc(100svh-3.5rem)] flex-col justify-center py-16"
      >
        <h1
          id="about-cover-title"
          className="text-foreground font-serif text-[clamp(3.5rem,11vw,9rem)] leading-none font-[640] tracking-[-0.04em]"
        >
          {t('profile.name')}
        </h1>
        <p className="text-muted-foreground mt-6 font-serif text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.2] font-[250] tracking-[-0.02em]">
          {t('profile.role')}
        </p>
      </section>

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <SectionDial items={chapters} label={t('index.label')} />

        <div className="min-w-0">
          <Chapter id={chapterIds.intro} title={t('index.intro')}>
            <p className="text-foreground mt-8 max-w-[34em] text-xl leading-[1.7] break-keep">
              {t('intro')}
            </p>
          </Chapter>

          <MeasureReel
            id={chapterIds.measurements}
            title={t('reel.label')}
            items={measurements}
          />

          <Chapter id={chapterIds.focus} title={t('focus.heading')}>
            <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1fr)_15rem]">
              <ul className="text-foreground space-y-4 text-[17px] leading-[1.7]">
                {focusItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <dl className="grid content-start gap-4">
                {profileFacts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-muted-foreground text-sm">
                      {fact.label}
                    </dt>
                    <dd className="text-foreground mt-0.5 text-[15px]">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Chapter>

          <Chapter id={chapterIds.career} title={t('experience.title')}>
            <ol className="mt-10 space-y-16">
              {career.map((entry) => (
                <li key={entry.id}>
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {entry.period}
                  </p>
                  <h3 className="text-foreground mt-2 font-serif text-[1.625rem] leading-[1.3] font-semibold tracking-[-0.02em]">
                    {entry.company}
                    <span className="text-muted-foreground ml-3 font-sans text-base font-normal tracking-normal">
                      {entry.role}
                    </span>
                  </h3>
                  <div className="mt-4 max-w-[38em] space-y-3">
                    {entry.paragraphs.map((paragraph, index) => (
                      <p
                        key={paragraph}
                        className={
                          index === 0
                            ? 'text-foreground text-[17px] leading-[1.75]'
                            : 'text-foreground/80 text-[15.5px] leading-[1.75]'
                        }
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </Chapter>

          <Chapter id={chapterIds.openSource} title={t('openSource.heading')}>
            <p className="text-foreground/85 mt-6 max-w-[38em] text-[17px] leading-[1.75]">
              {t('openSource.lead')}
            </p>
            <ol className="mt-10 space-y-8">
              {prs.map((pr) => (
                <li key={pr.key} className="max-w-[38em]">
                  <p className="text-muted-foreground text-sm">
                    {pr.project} {pr.id}
                  </p>
                  <h3 className="text-foreground mt-1 font-serif text-xl leading-[1.4] font-semibold tracking-[-0.015em]">
                    {pr.title}
                  </h3>
                  <p className="text-foreground/80 mt-2 text-[15.5px] leading-[1.75]">
                    {pr.desc}
                  </p>
                </li>
              ))}
            </ol>
            <h3 className="text-foreground mt-14 font-serif text-xl font-semibold tracking-[-0.015em]">
              {t('openSource.projectsHeading')}
            </h3>
            <div className="mt-3 max-w-[38em] space-y-3">
              {[t('openSource.firsttx'), t('openSource.mentoring')].map(
                (project) => (
                  <p
                    key={project}
                    className="text-foreground/80 text-[15.5px] leading-[1.75]"
                  >
                    {project}
                  </p>
                ),
              )}
            </div>
          </Chapter>

          <Chapter id={chapterIds.stack} title={t('stack.heading')}>
            <p className="text-foreground/85 mt-6 max-w-[38em] text-[17px] leading-[1.75] break-keep">
              {t('stack.line')}
            </p>
            <dl className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {stackGroups.map((group) => (
                <div key={group.label}>
                  <dt className="text-muted-foreground text-sm">
                    {group.label}
                  </dt>
                  <dd className="text-foreground mt-0.5 text-[15px]">
                    {group.items.join(', ')}
                  </dd>
                </div>
              ))}
            </dl>
          </Chapter>

          <Chapter id={chapterIds.connect} title={t('connect.heading')}>
            <p className="text-foreground/85 mt-6 max-w-[34em] text-[17px] leading-[1.75]">
              {t('connect.description')}
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-3">
              {connectLinks.map((link) => {
                const external = !link.href.startsWith('mailto');
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="text-foreground hover:text-accent-ink focus-visible:ring-ring rounded-sm font-serif text-[1.75rem] font-semibold tracking-[-0.02em] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Chapter>
        </div>
      </div>
    </div>
  );
}
