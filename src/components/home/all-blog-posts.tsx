import { BlogPost } from './blog-post';

export const AllBlogPosts = () => {
  return (
    <section className="grid grid-cols-3 gap-x-8 gap-y-12">
      {Array.from({ length: 5 }).map((_, idx) => (
        <BlogPost key={idx} />
      ))}
    </section>
  );
};
