import Image from 'next/image';
import { getPostBySlug } from '@/actions/post/getPostBySlug.action';

export const PostHeader = async ({ slug }: { slug: string }) => {
  const { data } = await getPostBySlug(slug);
  const post = data?.post;

  return (
    <>
      <div className="relative h-[calc(100vh/3)] w-full overflow-y-hidden">
        <Image
          src={post?.thumbnail ?? '/logo/logo.webp'}
          width={1200}
          height={675}
          priority
          className="aspect-video w-full object-cover"
          alt={post?.title ?? ''}
        />
        <div className="from-background pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>
      {post ? (
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-center text-3xl font-extrabold">{post.title}</h1>
          <p className="text-muted-foreground text-base font-medium">
            {post.description}
          </p>
        </div>
      ) : (
        <p className="text-destructive text-center font-bold">
          블로그 글을 찾을 수 없습니다.
        </p>
      )}
    </>
  );
};
