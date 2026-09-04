import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { EntryStamp } from '@/components/post/entry-stamp';
import { PostContent } from '@/components/post/post-content';
import {
  formatEntryNumber,
  formatPostDate,
  PostHeader,
} from '@/components/post/post-header';
import { PostTableOfContents } from '@/components/post/post-table-of-contents';
import { extractPostToc, type PostTocItem } from '@/components/post/post-toc';
import { ReadingProgress } from '@/components/post/reading-progress';
import { Link } from '@/i18n/navigation';
import { type AppLocale, appLocales, isAppLocale } from '@/i18n/routing';
import {
  getAlternates,
  getOpenGraphLocale,
  localizedPath,
  toAbsoluteUrl,
} from '@/i18n/seo';
import { commonOpenGraph } from '@/meta/open-graph';
import { pageRobots } from '@/meta/robots';
import {
  getAllPosts,
  getAllPostSlugs,
  getPostContent,
  getPostMetaBySlug,
  type PostListItem,
  type PostMeta,
} from '@/services/post.service';

export const dynamic = 'force-static';
export const dynamicParams = false;

const labels = {
  ko: {
    published: '게시일',
    updated: '수정일',
    readingTime: '읽기 시간',
    language: '언어',
    onThisPage: '이 글의 흐름',
    previous: '이전 글',
    next: '다음 글',
    read: '읽음',
    readTime: (minutes: number) => `${minutes}분`,
    sectionCount: (count: number) => `${count}개`,
    localeName: (locale: AppLocale) => (locale === 'ko' ? '한국어' : 'English'),
  },
  en: {
    published: 'Published',
    updated: 'Updated',
    readingTime: 'Reading time',
    language: 'Language',
    onThisPage: 'On this page',
    previous: 'Previous',
    next: 'Next',
    read: 'Read',
    readTime: (minutes: number) => `${minutes} min`,
    sectionCount: (count: number) => `${count}`,
    localeName: (locale: AppLocale) => (locale === 'ko' ? 'Korean' : 'English'),
  },
};

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
  const post = await getPostMetaBySlug(slug, safeLocale);

  if (!post) {
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

  const publishedTime = new Date(post.date).toISOString();

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
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
}

const getAdjacentPosts = (posts: PostListItem[], slug: string) => {
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  return {
    previousPost: currentIndex >= 0 ? posts[currentIndex + 1] : undefined,
    nextPost: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
  };
};

const PostMetaRail = ({
  post,
  toc,
  locale,
  entryNumber,
}: {
  post: PostMeta;
  toc: PostTocItem[];
  locale: AppLocale;
  entryNumber: number;
}) => {
  const label = labels[locale];
  const metaItems = [
    { label: label.published, value: formatPostDate(post.date, locale) },
    { label: label.readingTime, value: label.readTime(post.readingTime) },
    {
      label: label.language,
      value: label.localeName(post.resolvedLocale),
    },
  ];

  if (post.updatedAt) {
    metaItems.splice(1, 0, {
      label: label.updated,
      value: formatPostDate(post.updatedAt, locale),
    });
  }

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-7 text-sm">
        <div>
          <EntryStamp label={label.read}>
            <p className="text-foreground font-mono text-2xl tabular-nums">
              {formatEntryNumber(entryNumber)}
            </p>
          </EntryStamp>
          <dl className="mt-8 space-y-3">
            {metaItems.map((item) => (
              <div key={item.label}>
                <dt className="text-muted-foreground text-xs">{item.label}</dt>
                <dd className="text-foreground mt-0.5 font-mono text-xs tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        {toc.length > 0 && (
          <PostTableOfContents items={toc} label={label.onThisPage} />
        )}
      </div>
    </aside>
  );
};

const PostAdjacentNavigation = ({
  previousPost,
  nextPost,
  locale,
}: {
  previousPost?: PostListItem;
  nextPost?: PostListItem;
  locale: AppLocale;
}) => {
  const label = labels[locale];

  if (!previousPost && !nextPost) return null;

  const items = [
    previousPost && {
      key: 'previous',
      post: previousPost,
      title: label.previous,
      icon: ArrowLeft,
    },
    nextPost && {
      key: 'next',
      post: nextPost,
      title: label.next,
      icon: ArrowRight,
    },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <nav className="border-rule mt-14 border-b">
      {items.map((item) => (
        <Link
          key={item.key}
          href={`/post/${item.post.slug}`}
          className="focus-visible:ring-ring border-rule group grid gap-1 border-t py-4 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6"
        >
          <span className="text-muted-foreground group-hover:text-accent-ink inline-flex items-center gap-1.5 text-xs transition-colors duration-150">
            <item.icon className="h-3 w-3" />
            {item.title}
          </span>
          <span className="text-foreground group-hover:decoration-accent-ink line-clamp-2 text-sm font-medium underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-150">
            {item.post.title}
          </span>
        </Link>
      ))}
    </nav>
  );
};

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

  let postSource: Awaited<ReturnType<typeof getPostContent>>;
  let postMeta: PostMeta | null = null;

  try {
    postSource = await getPostContent(slug, safeLocale);
    postMeta = await getPostMetaBySlug(slug, safeLocale);
  } catch {
    notFound();
  }

  if (!postMeta) {
    notFound();
  }

  const toc = extractPostToc(postSource.source);
  const posts = await getAllPosts(safeLocale);
  const { previousPost, nextPost } = getAdjacentPosts(posts, slug);
  const postIndex = posts.findIndex((post) => post.slug === slug);
  const entryNumber = postIndex >= 0 ? posts.length - postIndex : 0;
  const label = labels[safeLocale];
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
    <div className="relative mx-auto grid w-full max-w-[1260px] grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[11rem_minmax(0,48rem)] lg:gap-10 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdPayload,
        }}
      />
      <div className="lg:hidden">
        <ReadingProgress orientation="horizontal" />
      </div>
      <PostMetaRail
        post={postMeta}
        toc={toc}
        locale={safeLocale}
        entryNumber={entryNumber}
      />
      <div className="min-w-0">
        <PostHeader
          post={postMeta}
          locale={safeLocale}
          entryNumber={entryNumber}
        />
        {toc.length > 0 && (
          <details className="border-rule group ledger-details border-b py-4 lg:hidden">
            <summary className="text-muted-foreground focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-xs focus-visible:ring-2 focus-visible:outline-none">
              <span>{label.onThisPage}</span>
              <span className="text-foreground flex items-center gap-2 font-mono tabular-nums">
                <span>{label.sectionCount(toc.length)}</span>
                <span aria-hidden="true" className="group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  -
                </span>
              </span>
            </summary>
            <PostTableOfContents
              items={toc}
              label={label.onThisPage}
              variant="mobile"
              showLabel={false}
              className="pt-4"
            />
          </details>
        )}
        <article className="prose prose-neutral dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-8 prose-a:text-accent-ink prose-a:font-medium prose-a:underline prose-a:decoration-accent-ink/40 prose-a:underline-offset-4 hover:prose-a:decoration-accent-ink prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:marker:text-muted-foreground prose-hr:border-rule prose-th:border-rule prose-td:border-rule prose-img:rounded-sm max-w-none py-9 [&_:not(pre)>code]:break-words [&_pre_code]:break-words [&_pre_code]:whitespace-pre-wrap [&_td]:break-words [&_td]:whitespace-normal [&_td_code]:break-all [&_td_code]:whitespace-normal [&_th]:break-words">
          <Suspense
            fallback={<div className="skeleton-shimmer h-[52vh] rounded-sm" />}
          >
            <PostContent
              slug={slug}
              locale={safeLocale}
              source={postSource.source}
              title={postMeta.title}
            />
          </Suspense>
        </article>
        <PostAdjacentNavigation
          previousPost={previousPost}
          nextPost={nextPost}
          locale={safeLocale}
        />
      </div>
    </div>
  );
}
