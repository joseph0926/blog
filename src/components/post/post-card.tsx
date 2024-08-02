import { GridLayoutTitle } from '@/components/ui/grid-layout';
import { Post } from '@/types/post';
import { Badge } from 'lucide-react';
import { CSSProperties } from 'react';

export function PostCard({
  post,
  imageSize,
}: {
  post: Post;
  imageSize: { width: number; height: number };
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
        <Badge key={tag} className="rounded-[1rem]">
          {tag}
        </Badge>
      ))}
    </div>
  );

  const imageStyle: CSSProperties = {
    '--image-width': `${imageSize.width}px`,
    '--image-height': `${imageSize.height}px`,
  } as CSSProperties;

  return (
    <GridLayoutTitle
      gridTitle={postTitle}
      gridDescription={postDescription}
      image={{
        src: post.image,
        alt: post.title,
        width: imageSize.width,
        height: imageSize.height,
        className: 'w-[var(--image-width)] h-[var(--image-height)]',
      }}
      className="flex flex-col justify-between"
    />
  );
}
