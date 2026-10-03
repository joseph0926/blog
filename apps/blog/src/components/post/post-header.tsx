import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { formatPostLongDate } from '@/lib/post-format';
import type { PostMeta } from '@/services/post.service';
import { PostTitle } from './post-title';

const labels = {
  ko: {
    back: '모든 글',
    fallback: '영문 번역이 없어 한국어 원문을 보여드립니다.',
    readTime: (minutes: number) => `${minutes}분`,
    updated: (date: string) => `${date} 수정`,
  },
  en: {
    back: 'All posts',
    fallback:
      'English translation is not available yet. Showing the Korean original.',
    readTime: (minutes: number) => `${minutes} min`,
    updated: (date: string) => `updated ${date}`,
  },
};

export const POST_TITLE_ID = 'post-title';

export const PostHeader = ({
  post,
  locale,
}: {
  post: PostMeta;
  locale: AppLocale;
}) => {
  const label = labels[locale];
  const restMeta = [
    post.updatedAt && label.updated(formatPostLongDate(post.updatedAt, locale)),
    label.readTime(post.readingTime),
    ...post.tags.slice(0, 4),
  ].filter(Boolean);

  return (
    <header className="pt-10 lg:pt-32">
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-8 inline-block rounded-sm text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none lg:hidden"
      >
        {label.back}
      </Link>
      <PostTitle id={POST_TITLE_ID} title={post.title} />
      <p className="text-muted-foreground mt-6 text-[14.5px]">
        <time dateTime={new Date(post.date).toISOString()}>
          {formatPostLongDate(post.date, locale)}
        </time>
        {restMeta.length > 0 && `, ${restMeta.join(', ')}`}
      </p>
      {post.description && (
        <p className="text-foreground mt-7 max-w-[34em] text-lg leading-[1.7]">
          {post.description}
        </p>
      )}
      {post.isFallback && (
        <p className="text-muted-foreground bg-muted mt-7 max-w-[68ch] rounded-[4px] px-4 py-3 text-sm">
          {label.fallback}
        </p>
      )}
    </header>
  );
};
