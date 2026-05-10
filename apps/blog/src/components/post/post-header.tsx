import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import type { PostMeta } from '@/services/post.service';

const labels = {
  ko: {
    back: '모든 글',
    fallback: '영문 번역이 없어 한국어 원문을 보여드립니다.',
    readTime: (minutes: number) => `${minutes}분 읽기`,
  },
  en: {
    back: 'All posts',
    fallback:
      'English translation is not available yet. Showing the Korean original.',
    readTime: (minutes: number) => `${minutes} min read`,
  },
};

export const formatPostDate = (date: Date | string, locale: AppLocale) =>
  format(new Date(date), locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd, yyyy', {
    locale: locale === 'ko' ? ko : enUS,
  });

export const PostHeader = ({
  post,
  locale,
}: {
  post: PostMeta;
  locale: AppLocale;
}) => {
  const label = labels[locale];
  const primaryTag = post.tags[0] ?? 'Essay';

  return (
    <header className="border-border/70 border-b pb-8 lg:pb-10">
      <Link
        href="/blog"
        className="text-primary hover:text-foreground focus-visible:ring-ring mb-8 inline-flex items-center gap-2 rounded-sm text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
      >
        <ArrowLeft className="h-4 w-4" />
        {label.back}
      </Link>
      <p className="text-primary mb-5 font-mono text-xs font-medium tracking-normal uppercase">
        {primaryTag}
      </p>
      <h1 className="text-foreground max-w-4xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {post.title}
      </h1>
      {post.description && (
        <p className="text-muted-foreground mt-6 max-w-3xl text-lg leading-8 sm:text-xl">
          {post.description}
        </p>
      )}
      <div className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs tabular-nums">
        <time dateTime={new Date(post.date).toISOString()}>
          {formatPostDate(post.date, locale)}
        </time>
        <span>{label.readTime(post.readingTime)}</span>
        {post.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="border-border/80 text-foreground rounded-sm border px-2 py-1 font-mono text-[11px]"
          >
            {tag}
          </span>
        ))}
      </div>
      {post.isFallback && (
        <p className="text-muted-foreground mt-4 max-w-2xl text-sm">
          {label.fallback}
        </p>
      )}
    </header>
  );
};
