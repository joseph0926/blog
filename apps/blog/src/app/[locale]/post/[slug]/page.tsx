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
import {
  getAllPostSlugs,
  getPostContent,
  getPostMetaBySlug,
} from '@/services/post.service';

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
    const publishedTime = new Date(post.createdAt).toISOString();

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
        publishedTime,
        authors: ['김영훈'],
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
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.description,
        images: post.thumbnail ? [post.thumbnail] : ['/logo/logo.webp'],
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
      twitter: {
        card: 'summary_large_image',
        title: t('postFallbackTitle'),
        description: t('postFallbackDescription'),
        images: ['/logo/logo.webp'],
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
  const canonicalPath = `/post/${slug}`;
  const canonicalUrl = toAbsoluteUrl(localizedPath(safeLocale, canonicalPath));
  const authorName = '김영훈';

  let postMeta: Awaited<ReturnType<typeof getPostMetaBySlug>> = null;
  try {
    await getPostContent(slug, safeLocale);
    postMeta = await getPostMetaBySlug(slug, safeLocale);
  } catch {
    notFound();
  }

  if (!postMeta) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postMeta.title,
    description: postMeta.description,
    inLanguage: postMeta.resolvedLocale,
    datePublished: new Date(postMeta.date).toISOString(),
    dateModified: new Date(postMeta.updatedAt ?? postMeta.date).toISOString(),
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    image: postMeta.thumbnail ? [toAbsoluteUrl(postMeta.thumbnail)] : undefined,
    author: {
      '@type': 'Person',
      name: authorName,
      url: toAbsoluteUrl('/about'),
    },
    publisher: {
      '@type': 'Person',
      name: authorName,
      url: toAbsoluteUrl('/about'),
    },
    keywords: postMeta.tags,
  };
  const jsonLdPayload = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

  return (
    <Container as="main" size="lg" className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdPayload,
        }}
      />
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
