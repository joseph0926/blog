import { getRecentPosts } from '@/actions/post.action';
import { BlogPost } from './blog-post';

export const AllBlogPosts = async () => {
  const { data, message, success } = await getRecentPosts({ limit: 3 });

  const posts = data?.posts;

  if (!success || !posts) {
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
