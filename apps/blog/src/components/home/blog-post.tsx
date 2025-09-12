import { Badge } from '@joseph0926/ui/components/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { ENV } from '@/lib/env';
import { cn } from '@/lib/utils';
import { PostResponse } from '@/types/post.type';

type BlogPostProps = {
  post: PostResponse;
  type?: 'row' | 'col';
  disabled?: boolean;
};

export const BlogPost = ({
  post,
  type = 'col',
  disabled = false,
}: BlogPostProps) => {
  return (
    <article
      className={cn(
        'flex w-full gap-8',
        type === 'row' ? 'flex-row' : 'flex-col',
        disabled ? 'cursor-not-allowed opacity-50' : 'opacity-100',
      )}
    >
      <Image
        src={post?.thumbnail ?? '/logo/logo.webp'}
        width={1200}
        height={675}
        priority
        unoptimized={ENV === 'dev'}
        alt={post.title}
        className={cn(
          'aspect-video rounded-lg object-cover',
          type === 'row' ? 'w-1/3 sm:w-1/2' : 'w-full',
        )}
      />
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground text-sm">
          {format(new Date(post.createdAt), 'yyyy-MM-dd')}
        </span>
        <Link
          href={disabled ? '#' : `/post/${post.slug}`}
          className={cn(disabled ? 'cursor-not-allowed' : 'hover:underline')}
        >
          <h2 className="line-clamp-1 text-2xl font-semibold">{post.title}</h2>
        </Link>
        <p className="text-muted-foreground line-clamp-1 text-base">
          {post.description}
        </p>
        <ul className="flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="mt-0.5 inline-block rounded-full px-2.5 text-xs font-medium md:mt-3"
            >
              {tag.name.toUpperCase()}
            </Badge>
          ))}
        </ul>
      </div>
    </article>
  );
};
