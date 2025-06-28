import { compileMDX } from 'next-mdx-remote/rsc';
import { FiberWrapper, StackReconciler } from '@/mdx/components';
import { getPostContent } from '@/services/post.service';

export async function PostContent({ slug }: { slug: string }) {
  const { source } = await getPostContent(slug);

  const { content } = await compileMDX({
    source,
    components: { StackReconciler, FiberWrapper },
    options: { parseFrontmatter: true },
  });

  return content;
}
