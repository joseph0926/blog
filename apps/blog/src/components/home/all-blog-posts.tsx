import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogPost } from './blog-post';

export const AllBlogPosts = async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts = null;
  let message = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 3 });

    posts = result.posts;
    message = result.message;
  } catch (e) {
    console.error(`Failed to fetch posts`, e);
  }

  if (!posts) {
    return <div>게시글을 불러오는 중 에러가 발생했습니다. ({message})</div>;
  }
  if (posts.length === 0) {
    return <div>아직 등록된 게시글이 없습니다.</div>;
  }
  return (
    <section className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogPost key={post.id} post={post} />
      ))}
    </section>
  );
};
