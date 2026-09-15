import { getTranslations } from 'next-intl/server';
import { INFO } from '@/constants/info';
import type { AppLocale } from '@/i18n/routing';
import { AboutCover } from './about-cover';
import { AboutScrollProvider } from './about-scroll';
import { AboutStage } from './about-stage';
import { type CareerEntry, CareerTimeline } from './career-timeline';
import { type Chapter, ChapterIndex } from './chapter-index';
import { ConnectSection } from './connect-section';
import { IntroReveal } from './intro-reveal';
import type { Measurement } from './measure';
import { PinnedReel } from './pinned-reel';
import { type PrEntry, PrReveal } from './pr-reveal';
import { ScrubSection } from './scrub-section';
import { VelocityMarquee } from './velocity-marquee';

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

  const chapters: Chapter[] = [
    { id: chapterIds.intro, label: t('index.intro') },
    { id: chapterIds.measurements, label: t('reel.label') },
    { id: chapterIds.focus, label: t('focus.heading') },
    { id: chapterIds.career, label: t('experience.title') },
    { id: chapterIds.openSource, label: t('openSource.heading') },
    { id: chapterIds.stack, label: t('stack.heading') },
    { id: chapterIds.connect, label: t('connect.heading') },
  ].map((chapter, index) => ({
    ...chapter,
    number: String(index + 1).padStart(2, '0'),
  }));
  const numberOf = (id: string) =>
    chapters.find((chapter) => chapter.id === id)?.number ?? '';

  return (
    <AboutScrollProvider>
      <div className="relative isolate">
        <AboutStage />

        <AboutCover
          hint={t('coverHint')}
          name={t('profile.name')}
          role={t('profile.role')}
          scrollHint={t('scrollHint')}
          scrollTarget={chapterIds.intro}
        />

        <div className="mx-auto max-w-[1260px] px-4 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
          <ChapterIndex
            label={t('index.label')}
            name={t('profile.name')}
            chapters={chapters}
          />

          <div className="min-w-0">
            <IntroReveal
              id={chapterIds.intro}
              number={numberOf(chapterIds.intro)}
              title={t('index.intro')}
              text={t('intro')}
            />

            <PinnedReel
              id={chapterIds.measurements}
              number={numberOf(chapterIds.measurements)}
              label={t('reel.label')}
              items={measurements}
            />

            <ScrubSection
              id={chapterIds.focus}
              number={numberOf(chapterIds.focus)}
              title={t('focus.heading')}
            >
              <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_16rem]">
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
            </ScrubSection>

            <ScrubSection
              id={chapterIds.career}
              number={numberOf(chapterIds.career)}
              title={t('experience.title')}
            >
              <CareerTimeline
                entries={career}
                chapterLabel={t('careerLabel')}
              />
            </ScrubSection>

            <PrReveal
              id={chapterIds.openSource}
              number={numberOf(chapterIds.openSource)}
              title={t('openSource.heading')}
              lead={t('openSource.lead')}
              prs={prs}
              projectsHeading={t('openSource.projectsHeading')}
              projects={[t('openSource.firsttx'), t('openSource.mentoring')]}
            />

            <ScrubSection
              id={chapterIds.stack}
              number={numberOf(chapterIds.stack)}
              title={t('stack.heading')}
            >
              <div className="mt-8">
                <VelocityMarquee
                  items={stackGroups.flatMap((group) => group.items)}
                />
              </div>
              <p className="text-foreground mt-8 max-w-[68ch] text-base leading-7 break-keep">
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
            </ScrubSection>

            <ConnectSection
              id={chapterIds.connect}
              number={numberOf(chapterIds.connect)}
              title={t('connect.heading')}
              name={t('profile.name')}
              role={t('profile.role')}
              description={t('connect.description')}
              links={connectLinks}
            />
          </div>
        </div>
      </div>
    </AboutScrollProvider>
  );
}
