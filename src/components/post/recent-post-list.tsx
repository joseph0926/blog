import { PostCard } from '@/components/post/post-card';
import { GridLayout, GridLayoutHeader } from '@/components/ui/grid-layout';
import { Post } from '@/types/post';

export function RecentPostList({ posts }: { posts: Post[] }) {
  return (
    <>
      <h1 className="mt-6 text-2xl font-bold">최근 게시글</h1>
      <GridLayout className="md:grid-cols-2">
        <GridLayoutHeader className="row-span-2 h-full">
          <PostCard
            post={posts[0]}
            imageSize={{ width: 592, height: 350, className: 'w-full h-[350px]' }}
            className="flex-col justify-between"
          />
        </GridLayoutHeader>
        <GridLayoutHeader className="row-span-2">
          <PostCard
            post={posts[1]}
            imageSize={{ width: 320, height: 200, className: 'min-w-[30%] h-full' }}
            className="flex-row justify-between gap-6"
          />
          <PostCard
            post={posts[2]}
            imageSize={{ width: 320, height: 200, className: 'min-w-[30%] h-full' }}
            className="flex-row justify-between gap-6"
          />
        </GridLayoutHeader>
        <GridLayoutHeader className="md:col-span-2">
          <PostCard
            post={posts[3]}
            imageSize={{ width: 320, height: 200, className: 'min-w-[30%] h-full' }}
            className="flex-row justify-between gap-6"
          />
        </GridLayoutHeader>
      </GridLayout>
    </>
  );
}
