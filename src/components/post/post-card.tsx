import { Badge } from '@/components/ui/badge';
import { GridLayoutTitle } from '@/components/ui/grid-layout';
import { cn } from '@/lib/utils';
import { Post } from '@/types/post';

export function PostCard({
  post,
  imageSize,
  className,
}: {
  post: Post;
  imageSize?: { width: number; height: number; className?: string };
  className?: string;
}) {
  const postTitle = (
    <div className="flex flex-col gap-3 pt-2">
      <h1>
        {post.author} • {post.date}
      </h1>
      <h2>{post.title}</h2>
      <p>{post.description}</p>
    </div>
  );

  const postDescription = (
    <div className="flex items-center gap-2">
      {post.tags.map((tag: string) => (
        <Badge key={tag} className="rounded-[1rem] px-2.5 py-1.5">
          {tag}
        </Badge>
      ))}
    </div>
  );

  return (
    <GridLayoutTitle
      gridTitle={postTitle}
      gridDescription={postDescription}
      image={{
        src: post.image,
        alt: post.title,
        width: imageSize?.width,
        height: imageSize?.height,
        className: imageSize?.className,
      }}
      className={cn('flex', className)}
    />
  );
}
