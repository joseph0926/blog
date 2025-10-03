import { compileMDX } from 'next-mdx-remote/rsc';
import { Counter, CounterFn } from '@/mdx/components/use-state/counter';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_10_03_React_Usestate() {
  const { source } = await getPostContent('2025-10-03-react-usestate');

  const { content } = await compileMDX({
    source,
    components: {
      Counter,
      CounterFn,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
