import { JSX } from 'react';
import { getRecentPosts } from '@/actions/post.action';
import { BlogPost } from './blog-post';

const LIMIT = 4;

export const RecentBlogPosts = async () => {
  const { data, message, success } = await getRecentPosts(LIMIT);
  const posts = data?.posts;

  if (!success || !posts) {
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
          {/* TODO: 블로그 순서 임시 변경 */}
          <BlogPost post={posts[2]} />
          <div className="grid grid-cols-1 gap-y-12">
            <BlogPost type="row" post={posts[1]} disabled />
            <BlogPost type="row" post={posts[0]} disabled />
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
