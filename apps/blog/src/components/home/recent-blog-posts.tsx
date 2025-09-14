import { JSX } from 'react';
import { createTRPCContext } from '@/server/trpc/context';
import { appRouter } from '@/server/trpc/root';
import { BlogPost } from './blog-post';

export const RecentBlogPosts = async () => {
  const ctx = await createTRPCContext({ headers: new Headers() });

  let posts = null;
  let message = null;
  try {
    const result = await appRouter
      .createCaller(ctx)
      .post.getPosts({ limit: 4 });

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

  let content: JSX.Element = <div>아직 등록된 게시글이 없습니다.</div>;
  switch (posts.length) {
    case 1:
      content = (
        <section className="grid grid-cols-1 gap-x-8 gap-y-12">
          <BlogPost post={posts[0]} type="row" />
        </section>
      );
      break;
    case 2:
      content = (
        <section className="grid grid-cols-1 gap-x-8 gap-y-12">
          <BlogPost post={posts[0]} type="row" />
          <BlogPost post={posts[1]} type="row" />
        </section>
      );
      break;
    case 3:
      content = (
        <section className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
          <BlogPost post={posts[0]} />
          <div className="grid grid-cols-1 gap-y-12">
            <BlogPost type="row" post={posts[1]} />
            <BlogPost type="row" post={posts[2]} />
          </div>
        </section>
      );
      break;
    default:
      content = (
        <>
          <section className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
            <BlogPost post={posts[0]} />
            <div className="grid grid-cols-1 gap-y-12">
              <BlogPost type="row" post={posts[1]} />
              <BlogPost type="row" post={posts[2]} />
            </div>
          </section>
          <BlogPost type="row" post={posts[3]} />
        </>
      );
      break;
  }
  return content;
};
