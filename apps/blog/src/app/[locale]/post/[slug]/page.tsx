import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { PostContent } from '@/components/post/post-content';
import { formatPostDate, PostHeader } from '@/components/post/post-header';
import { PostTableOfContents } from '@/components/post/post-table-of-contents';
import { extractPostToc, type PostTocItem } from '@/components/post/post-toc';
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
    sections: '목차',
    topics: '주제',
    onThisPage: '이 글의 흐름',
    articleMeta: '글 정보',
    previous: '이전 글',
    next: '다음 글',
    readTime: (minutes: number) => `${minutes}분`,
    sectionCount: (count: number) => `${count}개`,
    localeName: (locale: AppLocale) => (locale === 'ko' ? '한국어' : 'English'),
  },
  en: {
    published: 'Published',
    updated: 'Updated',
    readingTime: 'Reading time',
    language: 'Language',
    sections: 'Sections',
    topics: 'Topics',
    onThisPage: 'On this page',
    articleMeta: 'Article info',
    previous: 'Previous',
    next: 'Next',
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
}: {
  post: PostMeta;
  toc: PostTocItem[];
  locale: AppLocale;
}) => {
  const label = labels[locale];
  const metaItems = [
    {
      label: label.published,
      value: formatPostDate(post.date, locale),
    },
    {
      label: label.readingTime,
      value: label.readTime(post.readingTime),
    },
    {
      label: label.language,
      value: label.localeName(post.resolvedLocale),
    },
    {
      label: label.sections,
      value: label.sectionCount(toc.length),
    },
  ];

  if (post.updatedAt) {
    metaItems.splice(1, 0, {
      label: label.updated,
      value: formatPostDate(post.updatedAt, locale),
    });
  }

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-28 space-y-8 text-sm">
        <section className="border-border/70 border-b pb-7">
          <p className="text-muted-foreground mb-4 font-mono text-[11px] font-medium tracking-wider uppercase">
            {label.articleMeta}
          </p>
          <dl className="space-y-5">
            {metaItems.map((item) => (
              <div key={item.label}>
                <dt className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
                  {item.label}
                </dt>
                <dd className="text-foreground mt-1 font-mono text-xs tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        {post.tags.length > 0 && (
          <section className="border-border/70 border-b pb-7">
            <p className="text-muted-foreground mb-4 font-mono text-[11px] font-medium tracking-wider uppercase">
              {label.topics}
            </p>
            <div className="flex flex-col items-start gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-muted-foreground font-mono text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
};

const MobilePostMeta = ({
  post,
  toc,
  locale,
}: {
  post: PostMeta;
  toc: PostTocItem[];
  locale: AppLocale;
}) => {
  const label = labels[locale];

  return (
    <div className="border-border/70 grid gap-4 border-b py-5 text-sm sm:grid-cols-3 xl:hidden">
      <div>
        <p className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
          {label.published}
        </p>
        <p className="text-foreground mt-1 font-mono text-xs tabular-nums">
          {formatPostDate(post.date, locale)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
          {label.readingTime}
        </p>
        <p className="text-foreground mt-1 font-mono text-xs tabular-nums">
          {label.readTime(post.readingTime)}
        </p>
      </div>
      <div>
        <p className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
          {label.sections}
        </p>
        <p className="text-foreground mt-1 font-mono text-xs tabular-nums">
          {label.sectionCount(toc.length)}
        </p>
      </div>
    </div>
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

  return (
    <nav className="border-border/70 mt-14 grid border-y sm:grid-cols-2">
      <div className="border-border/70 border-b py-5 sm:border-r sm:border-b-0 sm:pr-6">
        {previousPost && (
          <Link
            href={`/post/${previousPost.slug}`}
            className="focus-visible:ring-ring group block rounded-sm focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            <span className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
              {label.previous}
            </span>
            <span className="text-foreground group-hover:text-primary mt-2 block text-sm font-medium transition-colors duration-150">
              {previousPost.title}
            </span>
          </Link>
        )}
      </div>
      <div className="py-5 sm:pl-6 sm:text-right">
        {nextPost && (
          <Link
            href={`/post/${nextPost.slug}`}
            className="focus-visible:ring-ring group block rounded-sm focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
          >
            <span className="text-muted-foreground font-mono text-[11px] tracking-wider uppercase">
              {label.next}
            </span>
            <span className="text-foreground group-hover:text-primary mt-2 block text-sm font-medium transition-colors duration-150">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
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
    <div className="relative mx-auto grid w-full max-w-[1480px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,760px)_220px] lg:gap-10 lg:py-10 xl:grid-cols-[220px_minmax(0,760px)_240px] 2xl:grid-cols-[240px_minmax(0,800px)_260px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdPayload,
        }}
      />
      <PostMetaRail post={postMeta} toc={toc} locale={safeLocale} />
      <div className="min-w-0">
        <PostHeader post={postMeta} locale={safeLocale} />
        <MobilePostMeta post={postMeta} toc={toc} locale={safeLocale} />
        {toc.length > 0 && (
          <details className="border-border/70 group border-b py-5 lg:hidden">
            <summary className="text-muted-foreground flex cursor-pointer list-none items-center justify-between gap-4 font-mono text-[11px] font-medium tracking-wider uppercase">
              <span>{label.onThisPage}</span>
              <span className="text-foreground flex items-center gap-2 tabular-nums">
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
        <article className="prose prose-neutral dark:prose-invert prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-8 prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:text-foreground prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:marker:text-muted-foreground prose-hr:border-border prose-th:border-border prose-td:border-border max-w-none py-9 [&_:not(pre)>code]:break-words [&_pre_code]:break-words [&_pre_code]:whitespace-pre-wrap [&_td]:break-words [&_td]:whitespace-normal [&_td_code]:break-all [&_td_code]:whitespace-normal [&_th]:break-words">
          <Suspense
            fallback={
              <div className="bg-muted/60 h-[52vh] animate-pulse rounded-md" />
            }
          >
            <PostContent
              slug={slug}
              locale={safeLocale}
              source={postSource.source}
            />
          </Suspense>
        </article>
        <PostAdjacentNavigation
          previousPost={previousPost}
          nextPost={nextPost}
          locale={safeLocale}
        />
      </div>
      <aside className="hidden lg:block">
        <PostTableOfContents
          items={toc}
          label={label.onThisPage}
          className="sticky top-28"
        />
      </aside>
    </div>
  );
}
