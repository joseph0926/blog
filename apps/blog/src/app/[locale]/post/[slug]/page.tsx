import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { PostHeaderLoading } from '@/components/loading/post-header.loading';
import { PostContent } from '@/components/post/post-content';
import { PostHeader } from '@/components/post/post-header';
import { Container } from '@/components/ui/container';
import { appLocales, isAppLocale } from '@/i18n/routing';
import {
  getAlternates,
  getOpenGraphLocale,
  localizedPath,
  toAbsoluteUrl,
} from '@/i18n/seo';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { getAllPostSlugs, getPostContent } from '@/services/post.service';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return appLocales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';
  const t = await getTranslations({ locale: safeLocale, namespace: 'meta' });
  const ctx = await createTRPCContext({ headers: new Headers() });

  try {
    const { post } = await appRouter
      .createCaller(ctx)
      .post.getPostBySlug({ slug, locale: safeLocale });
    const keywords = post.tags.map((tag) => tag.name);

    return {
      title: post.title,
      description: post.description,
      keywords,
      alternates: getAlternates(safeLocale, `/post/${slug}`),
      openGraph: {
        ...commonOpenGraph,
        title: post.title,
        description: post.description,
        url: toAbsoluteUrl(localizedPath(safeLocale, `/post/${slug}`)),
        type: 'article',
        locale: getOpenGraphLocale(safeLocale),
        images: post.thumbnail
          ? [
              {
                url: post.thumbnail,
                width: 1200,
                height: 630,
                alt: `${post.title} image`,
              },
            ]
          : commonOpenGraph?.images,
      },
      robots: pageRobots.blogPost,
    };
  } catch {
    return {
      title: t('postFallbackTitle'),
      description: t('postFallbackDescription'),
      alternates: getAlternates(safeLocale, `/post/${slug}`),
      openGraph: {
        ...commonOpenGraph,
        locale: getOpenGraphLocale(safeLocale),
      },
      icons: { icon: '/logo/logo.svg' },
      robots: pageRobots.blogPost,
    };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const safeLocale = isAppLocale(locale) ? locale : 'ko';

  try {
    await getPostContent(slug, safeLocale);
  } catch {
    notFound();
  }

  return (
    <Container as="main" size="lg" className="relative">
      <Suspense fallback={<PostHeaderLoading />}>
        <PostHeader slug={slug} locale={safeLocale} />
      </Suspense>
      <article className="prose dark:prose-invert prose-pre:rounded-xl prose-pre:border prose-pre:border-border/70 prose-pre:bg-muted/55 prose-pre:text-foreground prose-pre:shadow-xs dark:prose-pre:border-white/20 dark:prose-pre:bg-black/35 dark:prose-pre:text-white/90 prose-pre:overflow-x-auto max-w-none py-8 [&_:not(pre)>code]:break-words [&_pre_code]:break-words [&_pre_code]:whitespace-pre-wrap [&_td]:break-words [&_td]:whitespace-normal [&_td_code]:break-all [&_td_code]:whitespace-normal [&_th]:break-words">
        <Suspense
          fallback={
            <div className="h-[67vh] animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
          }
        >
          <PostContent slug={slug} locale={safeLocale} />
        </Suspense>
      </article>
    </Container>
  );
}
