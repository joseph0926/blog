import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import type { AppLocale } from '@/i18n/routing';

type CareerEntry = {
  id: 'ea' | 'nhn' | 'pandora';
  period: string;
  company: string;
  role: string;
  highlight: string;
  details: string[];
};

type PrEntry = {
  key: string;
  project: string;
  id: string;
  title: string;
  desc: string;
};

const careerIds = ['ea', 'nhn', 'pandora'] as const;

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

  const profileFacts = [
    { label: t('profileFacts.location'), value: t('meta.location') },
    { label: t('profileFacts.active'), value: t('meta.activeSince') },
    { label: t('profileFacts.openSource'), value: t('meta.openSourceTotal') },
    { label: t('profileFacts.stack'), value: t('profileFacts.stackValue') },
  ];

  const stats = [
    { value: String(prs.length), label: t('stats.pullRequests') },
    { value: String(career.length), label: t('stats.careerChapters') },
    { value: '2023.07', label: t('stats.activeSince') },
    { value: 'React', label: t('stats.primaryStack') },
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

  return (
    <Container size="lg" as="div" className="py-10 sm:py-14 lg:py-16">
      <main className="border-border/70 border-y">
        <header className="border-border/70 grid gap-10 border-b py-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
          <div className="grid gap-7 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start">
            <div className="space-y-4">
              <p className="text-foreground text-4xl leading-none font-semibold whitespace-nowrap sm:text-5xl">
                {locale === 'ko' ? '김영훈' : 'YK'}
              </p>
              <div className="bg-primary h-1 w-12" />
            </div>
            <div className="max-w-[680px]">
              <p className="text-muted-foreground text-xs font-medium uppercase">
                {t('profile.role')}
              </p>
              <h1 className="text-foreground mt-3 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
                {t('aboutTitle')}
              </h1>
              <p className="text-foreground mt-6 max-w-[62ch] text-base leading-7 sm:text-lg sm:leading-8">
                {t('intro')}
              </p>
            </div>
          </div>
          <dl className="grid content-start gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-1">
            {profileFacts.map((fact) => (
              <div key={fact.label} className="grid gap-1">
                <dt className="text-muted-foreground text-xs font-medium uppercase">
                  {fact.label}
                </dt>
                <dd className="text-foreground text-sm leading-6">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </header>
        <div className="grid lg:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]">
          <aside className="border-border/70 border-b py-10 lg:border-r lg:border-b-0 lg:pr-10">
            <section>
              <p className="text-muted-foreground text-xs font-medium uppercase">
                {t('experience.eyebrow')}
              </p>
              <h2 className="text-foreground mt-3 text-2xl font-semibold">
                {t('experience.title')}
              </h2>
              <ol className="before:bg-border relative mt-8 space-y-9 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px">
                {career.map((entry) => (
                  <li key={entry.id} className="relative pl-8">
                    <span className="bg-foreground absolute top-[7px] left-0 h-2.5 w-2.5 rounded-full" />
                    <p className="text-muted-foreground font-mono text-xs leading-5 tabular-nums">
                      {entry.period}
                    </p>
                    <h3 className="text-foreground mt-2 text-base font-medium">
                      {entry.company}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {entry.role}
                    </p>
                    <p className="text-foreground mt-3 text-sm leading-6">
                      {entry.highlight}
                    </p>
                    <ul className="text-muted-foreground mt-3 space-y-2 text-sm leading-6">
                      {entry.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>
            <section className="mt-12">
              <h2 className="text-muted-foreground text-xs font-medium uppercase">
                {t('focus.heading')}
              </h2>
              <ul className="text-foreground mt-4 space-y-2 text-sm leading-6">
                {focusItems.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="bg-primary mt-[0.7em] h-1 w-1 shrink-0 rounded-full" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
          <section className="py-10 lg:pl-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {t('openSource.eyebrow')}
                </p>
                <h2 className="text-foreground mt-3 text-2xl font-semibold">
                  {t('openSource.heading')}
                </h2>
              </div>
              <p className="text-muted-foreground max-w-[38ch] text-sm leading-6">
                {t('openSource.lead')}
              </p>
            </div>
            <ol className="divide-border/70 border-border/70 mt-8 divide-y border-y">
              {prs.map((pr) => (
                <li
                  key={pr.key}
                  className="grid gap-3 py-3.5 sm:grid-cols-[72px_132px_minmax(0,1fr)] sm:gap-5"
                >
                  <span className="text-muted-foreground font-mono text-xs leading-6 tabular-nums">
                    {pr.id}
                  </span>
                  <span className="text-foreground text-sm leading-6 font-medium">
                    {pr.project}
                  </span>
                  <div className="min-w-0">
                    <p className="text-foreground text-sm leading-6">
                      {pr.title}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {pr.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <section className="mt-10">
              <h2 className="text-muted-foreground text-xs font-medium uppercase">
                {t('stats.heading')}
              </h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-muted-foreground text-xs leading-5">
                      {stat.label}
                    </dt>
                    <dd className="text-foreground mt-1 font-mono text-3xl leading-none font-semibold tabular-nums">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </section>
        </div>
        <section className="border-border/70 grid gap-10 border-t py-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h2 className="text-muted-foreground text-xs font-medium uppercase">
              {t('stack.heading')}
            </h2>
            <p className="text-foreground mt-4 max-w-[72ch] text-base leading-7">
              {t('stack.line')}
            </p>
            <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {stackGroups.map((group) => (
                <div
                  key={group.label}
                  className="grid gap-2 sm:grid-cols-[96px_minmax(0,1fr)]"
                >
                  <dt className="text-muted-foreground text-xs font-medium uppercase">
                    {group.label}
                  </dt>
                  <dd className="text-foreground text-sm leading-6">
                    {group.items.join(', ')}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <footer>
            <h2 className="text-muted-foreground text-xs font-medium uppercase">
              {t('connect.heading')}
            </h2>
            <p className="text-foreground mt-4 text-sm leading-6">
              {t('connect.description')}
            </p>
            <p className="mt-5 text-sm leading-6">
              <a
                href="https://github.com/joseph0926"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              <span className="text-muted-foreground"> / </span>
              <a
                href="https://www.linkedin.com/in/joseph0926/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
              <span className="text-muted-foreground"> / </span>
              <a
                href="mailto:joseph0926.dev@gmail.com"
                className="text-foreground underline-offset-4 hover:underline"
              >
                {t('connect.email')}
              </a>
            </p>
          </footer>
        </section>
      </main>
    </Container>
  );
}
