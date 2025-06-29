import { compileMDX } from 'next-mdx-remote/rsc';
import {
  FiberWrapper,
  SonnerImpl1,
  SonnerImpl2,
  SonnerImpl3,
  SonnerImpl4,
  SonnerSample,
  StackReconciler,
} from '@/mdx/components';
import { getPostContent } from '@/services/post.service';

export async function PostContent({ slug }: { slug: string }) {
  const { source } = await getPostContent(slug);

  const { content } = await compileMDX({
    source,
    components: {
      StackReconciler,
      FiberWrapper,
      SonnerSample,
      SonnerImpl1,
      SonnerImpl2,
      SonnerImpl3,
      SonnerImpl4,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
