import { Badge } from '@joseph0926/ui/components/badge';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { ENV } from '@/lib/env';
import { serverTrpc } from '@/server/trpc/server';

export const PostHeader = async ({ slug }: { slug: string }) => {
  let post = null;
  try {
    const result = await serverTrpc.post.getPostBySlug({ slug });
    post = result.post;
  } catch {
    // 에러 발생 시 post는 null로 유지되어 에러 UI 표시
  }

  if (!post) {
    return (
      <p className="text-destructive py-12 text-center font-medium">
        블로그 글을 찾을 수 없습니다.
      </p>
    );
  }

  return (
    <header className="py-12">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {post.tags.slice(0, 3).map((tag) => (
          <Badge key={tag.id} variant="secondary" className="text-xs">
            {tag.name}
          </Badge>
        ))}
      </div>

      <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
        {post.title}
      </h1>

      <p className="text-muted-foreground mt-4 text-lg md:text-xl">
        {post.description}
      </p>

      <div className="text-muted-foreground mt-6 flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {format(new Date(post.createdAt), 'MMM dd, yyyy')}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {post.readingTime} min read
        </span>
      </div>

      {post.thumbnail && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.thumbnail}
            fill
            priority
            unoptimized={ENV === 'dev'}
            className="object-cover"
            alt={post.title}
          />
        </div>
      )}
    </header>
  );
};
