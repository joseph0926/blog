import { PostCard } from '@/components/post/post-card';
import { GridLayout, GridLayoutHeader } from '@/components/ui/grid-layout';
import { Post } from '@/types/post';

export function RecentPostList({ posts }: { posts: Post[] }) {
  return (
    <GridLayout className="md:grid-cols-2">
      <GridLayoutHeader className="row-span-2 h-full">
        <PostCard post={posts[0]} imageSize={{ width: 592, height: 228 }} />
      </GridLayoutHeader>
      <GridLayoutHeader className="row-span-2">
        <PostCard post={posts[1]} imageSize={{ width: 320, height: 200 }} />
        <PostCard post={posts[2]} imageSize={{ width: 320, height: 200 }} />
      </GridLayoutHeader>
      <GridLayoutHeader className="md:col-span-2">
        <PostCard post={posts[3]} imageSize={{ width: 0, height: 0 }} />
      </GridLayoutHeader>
    </GridLayout>
  );
}
