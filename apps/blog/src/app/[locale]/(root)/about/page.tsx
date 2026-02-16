import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ExperienceTimeline } from '@/components/about/experience-timeline';
import { OpenSourceSection } from '@/components/about/open-source-section';
import { ProfileHero } from '@/components/about/profile-hero';
import { SkillsGrid } from '@/components/about/skills-grid';
import { Container } from '@/components/ui/container';
import { isAppLocale } from '@/i18n/routing';
import {
  getAlternates,
  getOpenGraphLocale,
  localizedPath,
  toAbsoluteUrl,
} from '@/i18n/seo';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';
  const tAbout = await getTranslations({
    locale: safeLocale,
    namespace: 'about',
  });

  return {
    title: tAbout('metaTitle'),
    description: tAbout('metaDescription'),
    alternates: getAlternates(safeLocale, '/about'),
    openGraph: {
      ...commonOpenGraph,
      title: `${tAbout('metaTitle')} - 김영훈`,
      description: tAbout('metaDescription'),
      url: toAbsoluteUrl(localizedPath(safeLocale, '/about')),
      type: 'profile',
      locale: getOpenGraphLocale(safeLocale),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tAbout('metaTitle')} - 김영훈`,
      description: tAbout('metaDescription'),
      images: ['/logo/logo.webp'],
    },
    robots: pageRobots.about,
  };
}

export default function AboutPage() {
  return (
    <Container size="md">
      <ProfileHero />
      <ExperienceTimeline />
      <SkillsGrid />
      <OpenSourceSection />
    </Container>
  );
}
