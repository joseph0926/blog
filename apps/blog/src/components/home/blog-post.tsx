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

export const HomePostRow = ({ post, locale, className }: HomePostProps) => {
  return (
    <article className={cn('group', className)}>
      <Link
        href={`/post/${post.slug}`}
        className="focus-visible:ring-ring border-border/70 hover:bg-muted/20 relative grid gap-4 border-t py-6 pl-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none sm:grid-cols-[5.5rem_1fr_auto]"
      >
        <span
          aria-hidden="true"
          className="absolute top-6 bottom-6 left-0 w-0.5 rounded-full bg-[#5e6ad2] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
        <time
          dateTime={new Date(post.createdAt).toISOString()}
          className="text-muted-foreground font-mono text-xs leading-6 tabular-nums"
        >
          <span className="text-foreground block">
            {formatPostMonthDay(post.createdAt, locale)}
          </span>
          <span>{format(new Date(post.createdAt), 'yyyy')}</span>
        </time>
        <div className="min-w-0 space-y-2">
          <h3 className="text-foreground line-clamp-2 text-lg font-semibold tracking-tight sm:text-xl">
            {post.title}
          </h3>
          <p className="text-muted-foreground line-clamp-2 max-w-2xl text-sm leading-6">
            {post.description}
          </p>
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
              {post.tags.slice(0, 2).map((tag) => (
                <li
                  key={tag.id}
                  className="text-muted-foreground font-mono text-[11px]"
                >
                  {tag.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-3 sm:justify-end">
          <span className="font-mono text-xs tabular-nums">
            {formatReadTime(post.readingTime, locale)}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-[#5e6ad2]" />
        </div>
      </Link>
    </article>
  );
};

export const CompactPostLink = ({ post, locale, className }: HomePostProps) => {
  return (
    <article className={cn('group', className)}>
      <Link
        href={`/post/${post.slug}`}
        className="focus-visible:ring-ring hover:bg-muted/40 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none"
      >
        <time
          dateTime={new Date(post.createdAt).toISOString()}
          className="text-muted-foreground w-16 shrink-0 font-mono text-xs tabular-nums"
        >
          {formatPostDate(post.createdAt, locale)}
        </time>
        <span className="text-foreground line-clamp-1 flex-1 text-sm">
          {post.title}
        </span>
        <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0 opacity-0 transition-opacity duration-150 group-hover:text-[#5e6ad2] group-hover:opacity-100" />
      </Link>
    </article>
  );
};
