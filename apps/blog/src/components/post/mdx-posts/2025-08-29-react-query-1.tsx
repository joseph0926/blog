import { compileMDX } from 'next-mdx-remote/rsc';
import { ProxyTrack } from '@/mdx/components/react-query/proxy-track';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_08_29_React_Query_1() {
  const { source } = await getPostContent('2025-08-29-react-query-1');

  const { content } = await compileMDX({
    source,
    components: {
      ProxyTrack,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
