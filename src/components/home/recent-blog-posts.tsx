import { BlogPost } from './blog-post';

export const RecentBlogPosts = () => {
  return (
    <>
      <section className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
        <BlogPost />
        <div className="grid grid-cols-1 gap-y-12">
          <BlogPost type="row" />
          <BlogPost type="row" />
        </div>
      </section>
      <BlogPost type="row" />
    </>
  );
};
