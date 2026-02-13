'use client';

import { Badge } from '@joseph0926/ui/components/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { ENV } from '@/lib/env';
import { PostResponse } from '@/types/post.type';

type BlogPostCardProps = {
  post: PostResponse;
};

export const BlogPostCard = ({ post }: BlogPostCardProps) => {
  return (
    <article className="group h-full">
      <Link
        href={`/post/${post.slug}`}
        className="focus-visible:ring-ring block h-full rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <div className="border-border bg-card relative h-full overflow-hidden rounded-lg border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.thumbnail ?? '/logo/logo.webp'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={ENV === 'dev'}
              alt={post.title}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="p-5">
            <div className="text-muted-foreground mb-3 flex items-center gap-2 text-xs">
              <span>{format(new Date(post.createdAt), 'MMM dd, yyyy')}</span>
              <span className="bg-muted-foreground/50 h-1 w-1 rounded-full" />
              <span>{post.readingTime} min read</span>
            </div>

            <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold tracking-tight transition-colors duration-150">
              {post.title}
            </h3>

            <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
              {post.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="px-2 py-0.5 text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
              {post.tags.length > 2 && (
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  +{post.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};
