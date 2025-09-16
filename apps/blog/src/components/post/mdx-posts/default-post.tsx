import { compileMDX } from 'next-mdx-remote/rsc';
import { getPostContent } from '@/services/post.service';

interface DefaultPostProps {
  slug: string;
}

export async function DefaultPost({ slug }: DefaultPostProps) {
  const { source } = await getPostContent(slug);

  const { content } = await compileMDX({
    source,
    components: {},
    options: { parseFrontmatter: true },
  });

  return content;
}
