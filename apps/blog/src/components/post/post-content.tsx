import { compileMDX } from 'next-mdx-remote/rsc';
import { getMdxComponentsForSource } from '@/mdx/component-registry';
import { getPostContent } from '@/services/post.service';

interface PostContentProps {
  slug: string;
}

export async function PostContent({ slug }: PostContentProps) {
  const { source } = await getPostContent(slug);

  const components = await getMdxComponentsForSource(source);

  const { content } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: true },
  });

  return content;
}
