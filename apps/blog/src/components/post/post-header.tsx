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

export const formatEntryNumber = (entryNumber: number) =>
  `No. ${String(Math.max(entryNumber, 0)).padStart(3, '0')}`;

export const PostHeader = ({
  post,
  locale,
  entryNumber,
}: {
  post: PostMeta;
  locale: AppLocale;
  entryNumber: number;
}) => {
  const label = labels[locale];

  return (
    <header className="border-rule border-b pb-8">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <Link
          href="/blog"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-2 rounded-sm text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          {label.back}
        </Link>
        <p className="text-muted-foreground flex items-baseline gap-3 font-mono text-xs tabular-nums lg:hidden">
          <span className="text-foreground">
            {formatEntryNumber(entryNumber)}
          </span>
          <time dateTime={new Date(post.date).toISOString()}>
            {formatPostDate(post.date, locale)}
          </time>
        </p>
      </div>
      <h1 className="text-foreground max-w-[30ch] text-[2rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-4xl lg:text-[2.75rem]">
        {post.title}
      </h1>
      {post.description && (
        <p className="text-muted-foreground mt-5 max-w-[68ch] text-base leading-7 sm:text-lg sm:leading-8">
          {post.description}
        </p>
      )}
      <p className="text-muted-foreground mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-mono text-xs tabular-nums">
          {label.readTime(post.readingTime)}
        </span>
        {post.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="flex items-center gap-3">
            <span aria-hidden="true" className="bg-rule h-3 w-px" />
            {tag}
          </span>
        ))}
      </p>
      {post.isFallback && (
        <p className="border-accent-ink/60 text-muted-foreground mt-6 max-w-[68ch] border-l-2 pl-4 text-sm">
          {label.fallback}
        </p>
      )}
    </header>
  );
};
