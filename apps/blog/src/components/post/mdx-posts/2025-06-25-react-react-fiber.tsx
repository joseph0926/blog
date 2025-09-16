import { compileMDX } from 'next-mdx-remote/rsc';
import { FiberWrapper } from '@/mdx/components/fiber/fiber-wrapper';
import { StackReconciler } from '@/mdx/components/stack-reconciler';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_06_25_React_React_Fiber() {
  const { source } = await getPostContent('2025-06-25-react-react-fiber');

  const { content } = await compileMDX({
    source,
    components: {
      StackReconciler,
      FiberWrapper,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
