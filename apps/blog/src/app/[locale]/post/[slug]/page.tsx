import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import {
  SectionDial,
  type SectionDialItem,
} from '@/components/dial/section-dial';
import { PostContent } from '@/components/post/post-content';
import { POST_TITLE_ID, PostHeader } from '@/components/post/post-header';
import { extractPostToc } from '@/components/post/post-toc';
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
    onThisPage: '이 글의 흐름',
    intro: '도입',
    back: '모든 글',
    previous: '이전 글',
    next: '다음 글',
    sectionCount: (count: number) => `${count}개`,
  },
  en: {
    onThisPage: 'On this page',
    intro: 'Opening',
    back: 'All posts',
    previous: 'Previous',
    next: 'Next',
    sectionCount: (count: number) => `${count}`,
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
    },
    nextPost && { key: 'next', post: nextPost, title: label.next },
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <nav className="mt-20 grid gap-10 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={`/post/${item.post.slug}`}
          className="group focus-visible:ring-ring block rounded-sm focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          <span className="text-muted-foreground text-sm">{item.title}</span>
          <span className="text-foreground group-hover:text-accent-ink mt-1.5 line-clamp-2 block font-serif text-lg leading-[1.4] font-semibold tracking-[-0.015em] break-keep transition-colors duration-150">
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
  const label = labels[safeLocale];
  const sections: SectionDialItem[] = [
    { id: null, label: label.intro },
    ...toc
      .filter((item) => item.depth === 2)
      .map((item) => ({ id: item.id, label: item.text })),
  ];
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
    <div className="mx-auto grid w-full max-w-[1260px] grid-cols-1 px-4 lg:grid-cols-[15rem_minmax(0,44rem)] lg:gap-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdPayload,
        }}
      />
      <SectionDial
        items={sections}
        label={label.onThisPage}
        back={{ href: '/blog', label: label.back }}
        mobileBarAfterId={POST_TITLE_ID}
      />
      <div className="min-w-0 pb-28">
        <PostHeader post={postMeta} locale={safeLocale} />
        {toc.length > 0 && (
          <details className="group ledger-details bg-muted mt-10 rounded-[6px] px-4 py-3 lg:hidden">
            <summary className="text-muted-foreground focus-visible:ring-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-sm focus-visible:ring-2 focus-visible:outline-none">
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
            <ol className="space-y-1 pt-3 text-sm">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={
                      item.depth === 3
                        ? 'text-muted-foreground hover:text-foreground block py-1 pl-4'
                        : 'text-foreground hover:text-accent-ink block py-1'
                    }
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )}
        <article className="prose prose-neutral dark:prose-invert prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground/85 prose-p:leading-[1.75] prose-li:leading-[1.75] prose-a:text-accent-ink prose-a:font-medium prose-a:underline prose-a:decoration-accent-ink/40 prose-a:underline-offset-4 hover:prose-a:decoration-accent-ink prose-strong:text-foreground prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-li:marker:text-muted-foreground prose-hr:border-rule prose-th:border-rule prose-td:border-rule prose-img:rounded-[4px] max-w-none py-12 text-[17px] [&_:not(pre)>code]:break-words [&_pre_code]:break-words [&_pre_code]:whitespace-pre-wrap [&_td]:break-words [&_td]:whitespace-normal [&_td_code]:break-all [&_td_code]:whitespace-normal [&_th]:break-words">
          <Suspense
            fallback={
              <div className="skeleton-shimmer h-[52vh] rounded-[4px]" />
            }
          >
            <PostContent
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
