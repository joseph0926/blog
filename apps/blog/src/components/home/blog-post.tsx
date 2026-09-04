import { cn } from '@joseph0926/ui/lib/utils';
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import type { PostResponse } from '@/types/post.type';

type HomePostProps = {
  post: PostResponse;
  locale: AppLocale;
  entryNumber: number;
  className?: string;
};

const getDateLocale = (locale: AppLocale) => (locale === 'ko' ? ko : enUS);

export const formatPostDate = (date: Date, locale: AppLocale) =>
  format(new Date(date), locale === 'ko' ? 'yyyy.MM.dd' : 'MMM dd, yyyy', {
    locale: getDateLocale(locale),
  });

export const formatPostMonthDay = (date: Date, locale: AppLocale) =>
  format(new Date(date), locale === 'ko' ? 'MM.dd' : 'MMM dd', {
    locale: getDateLocale(locale),
  });

export const formatReadTime = (minutes: number, locale: AppLocale) =>
  locale === 'ko' ? `${minutes}분 읽기` : `${minutes} min read`;

export const formatEntryNumber = (entryNumber: number) =>
  `No. ${String(Math.max(entryNumber, 0)).padStart(3, '0')}`;

export const HomePostRow = ({
  post,
  locale,
  entryNumber,
  className,
}: HomePostProps) => {
  return (
    <article className={cn('group border-rule border-t', className)}>
      <Link
        href={`/post/${post.slug}`}
        className="focus-visible:ring-ring active:bg-muted/40 grid gap-2 py-6 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:gap-6"
      >
        <div className="text-muted-foreground flex items-baseline gap-3 font-mono text-xs tabular-nums sm:flex-col sm:gap-1">
          <span className="text-foreground">
            {formatEntryNumber(entryNumber)}
          </span>
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {formatPostDate(post.createdAt, locale)}
          </time>
        </div>
        <div className="max-w-[68ch] min-w-0">
          <h3 className="text-foreground group-hover:decoration-accent-ink text-lg font-semibold tracking-tight underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-150 sm:text-xl">
            {post.title}
          </h3>
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-6">
            {post.description}
          </p>
          {post.tags.length > 0 && (
            <ul className="text-muted-foreground mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {post.tags.slice(0, 3).map((tag) => (
                <li key={tag.id}>{tag.name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-3 font-mono text-xs tabular-nums sm:justify-end sm:self-start sm:pt-1">
          <span>{formatReadTime(post.readingTime, locale)}</span>
          <ArrowRight className="group-hover:text-accent-ink h-4 w-4 transition-colors duration-150" />
        </div>
      </Link>
    </article>
  );
};

export const CompactPostLink = ({
  post,
  locale,
  entryNumber,
  className,
}: HomePostProps) => {
  return (
    <article className={cn('group border-rule border-t', className)}>
      <Link
        href={`/post/${post.slug}`}
        className="focus-visible:ring-ring active:bg-muted/40 flex items-baseline gap-4 py-3 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      >
        <span className="text-muted-foreground w-14 shrink-0 font-mono text-xs tabular-nums">
          {formatEntryNumber(entryNumber)}
        </span>
        <span className="text-foreground group-hover:decoration-accent-ink line-clamp-1 flex-1 text-sm underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-150">
          {post.title}
        </span>
        <time
          dateTime={new Date(post.createdAt).toISOString()}
          className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums"
        >
          {formatPostMonthDay(post.createdAt, locale)}
        </time>
      </Link>
    </article>
  );
};
