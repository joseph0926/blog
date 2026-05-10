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

export async function AboutPageContent({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: 'about' });

  const career: CareerEntry[] = (['ea', 'nhn', 'pandora'] as const).map(
    (id) => ({
      id,
      period: t(`experience.items.${id}.period`),
      company: t(`experience.items.${id}.company`),
      role: t(`experience.items.${id}.role`),
      highlight: t(`experience.items.${id}.highlight1`),
      details: [
        t(`experience.items.${id}.highlight2`),
        t(`experience.items.${id}.highlight3`),
      ],
    }),
  );

  const prs: PrEntry[] = [
    {
      key: 'query-1',
      project: 'TanStack Query',
      id: '#8641',
      title: t('openSource.groups.query.pr1Title'),
      desc: t('openSource.groups.query.pr1Desc'),
    },
    {
      key: 'query-2',
      project: 'TanStack Query',
      id: '#9592',
      title: t('openSource.groups.query.pr2Title'),
      desc: t('openSource.groups.query.pr2Desc'),
    },
    {
      key: 'query-3',
      project: 'TanStack Query',
      id: '#9623',
      title: t('openSource.groups.query.pr3Title'),
      desc: t('openSource.groups.query.pr3Desc'),
    },
    {
      key: 'router-1',
      project: 'React Router',
      id: '#14286',
      title: t('openSource.groups.router.pr1Title'),
      desc: t('openSource.groups.router.pr1Desc'),
    },
    {
      key: 'router-2',
      project: 'React Router',
      id: '#14335',
      title: t('openSource.groups.router.pr2Title'),
      desc: t('openSource.groups.router.pr2Desc'),
    },
    {
      key: 'router-3',
      project: 'React Router',
      id: '#14534',
      title: t('openSource.groups.router.pr3Title'),
      desc: t('openSource.groups.router.pr3Desc'),
    },
    {
      key: 'router-4',
      project: 'React Router',
      id: '#14336',
      title: t('openSource.groups.router.pr4Title'),
      desc: t('openSource.groups.router.pr4Desc'),
    },
    {
      key: 'router-5',
      project: 'React Router',
      id: '#14467',
      title: t('openSource.groups.router.pr5Title'),
      desc: t('openSource.groups.router.pr5Desc'),
    },
    {
      key: 'rhf-1',
      project: 'React Hook Form',
      id: '#12865',
      title: t('openSource.groups.rhf.pr1Title'),
      desc: t('openSource.groups.rhf.pr1Desc'),
    },
    {
      key: 'tsr-1',
      project: 'TanStack Router',
      id: '#3611',
      title: t('openSource.groups.tsr.pr1Title'),
      desc: t('openSource.groups.tsr.pr1Desc'),
    },
  ];

  return (
    <Container size="lg" as="div" className="py-16 sm:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-20">
        <aside className="space-y-6 text-sm">
          <div>
            <p className="text-foreground font-medium">{t('profile.name')}</p>
            <p className="text-muted-foreground mt-1">{t('profile.role')}</p>
          </div>
          <p className="text-muted-foreground">{t('meta.location')}</p>
          <p className="text-muted-foreground font-mono text-xs tabular-nums">
            {t('meta.activeSince')}
          </p>
          <p className="text-muted-foreground">{t('meta.openSourceTotal')}</p>
          <p className="text-muted-foreground leading-6">
            {t('meta.stackLine')}
          </p>
        </aside>
        <main className="max-w-[640px] space-y-16">
          <header>
            <h1 className="text-foreground text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl">
              {t('aboutTitle')}
            </h1>
            <p className="text-foreground mt-6 text-base leading-7 sm:text-lg sm:leading-8">
              {t('intro')}
            </p>
          </header>
          <section>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight">
              {t('experience.title')}
            </h2>
            <ol className="mt-6 space-y-8">
              {career.map((entry) => (
                <li
                  key={entry.id}
                  className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-6"
                >
                  <p className="text-muted-foreground font-mono text-xs leading-6 tabular-nums">
                    {entry.period}
                  </p>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-foreground text-base font-medium">
                        {entry.company}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {entry.role}
                      </span>
                    </div>
                    <p className="text-foreground mt-2 text-sm leading-6">
                      {entry.highlight}
                    </p>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm leading-6">
                      {entry.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight">
              {t('openSource.heading')}
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {t('openSource.lead')}
            </p>
            <ol className="mt-6 space-y-5">
              {prs.map((pr) => (
                <li
                  key={pr.key}
                  className="grid gap-1 sm:grid-cols-[80px_minmax(0,1fr)] sm:gap-6"
                >
                  <span className="text-muted-foreground font-mono text-xs leading-6 tabular-nums">
                    {pr.id}
                  </span>
                  <div>
                    <p className="text-foreground text-sm leading-6">
                      <span className="font-medium">{pr.project}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        — {pr.title}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm leading-6">
                      {pr.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="text-foreground text-2xl font-semibold tracking-tight">
              {t('stack.heading')}
            </h2>
            <p className="text-foreground mt-4 text-base leading-7">
              {t('stack.line')}
            </p>
          </section>
          <footer className="pt-4 text-sm">
            <p>
              <a
                href="https://github.com/joseph0926"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                GitHub
              </a>
              <span className="text-muted-foreground"> · </span>
              <a
                href="https://www.linkedin.com/in/joseph0926/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                LinkedIn
              </a>
              <span className="text-muted-foreground"> · </span>
              <a
                href="mailto:joseph0926.dev@gmail.com"
                className="text-foreground underline-offset-4 hover:underline"
              >
                {t('connect.email')}
              </a>
            </p>
          </footer>
        </main>
      </div>
    </Container>
  );
}
