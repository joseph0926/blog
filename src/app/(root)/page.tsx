import { AllPostList } from '@/components/post/all-post-list';
import { RecentPostList } from '@/components/post/recent-post-list';
import { Post } from '@/types/post';

const dummyPosts: Post[] = [
  {
    author: 'Jane Doe',
    date: '2024-08-03',
    title: 'Exploring the Future of Technology',
    description:
      'This post delves into the emerging trends and technologies that are shaping the future. From AI to quantum computing, discover what lies ahead in the tech world.',
    tags: ['Technology', 'AI', 'Future', 'Innovation', 'Trends'],
    image:
      'https://images.unsplash.com/photo-1721853046219-209921be684e?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    author: 'Jane Doe',
    date: '2024-08-03',
    title: 'Exploring the Future of Technology',
    description:
      'This post delves into the emerging trends and technologies that are shaping the future. From AI to quantum computing, discover what lies ahead in the tech world.',
    tags: ['Technology', 'AI', 'Future', 'Innovation', 'Trends'],
    image:
      'https://images.unsplash.com/photo-1721853046219-209921be684e?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    author: 'Jane Doe',
    date: '2024-08-03',
    title: 'Exploring the Future of Technology',
    description:
      'This post delves into the emerging trends and technologies that are shaping the future. From AI to quantum computing, discover what lies ahead in the tech world.',
    tags: ['Technology', 'AI', 'Future', 'Innovation', 'Trends'],
    image:
      'https://images.unsplash.com/photo-1721853046219-209921be684e?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <RecentPostList posts={dummyPosts} />
      <AllPostList />
    </div>
  );
}
