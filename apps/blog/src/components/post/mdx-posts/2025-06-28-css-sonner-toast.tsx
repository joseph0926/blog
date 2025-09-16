import { compileMDX } from 'next-mdx-remote/rsc';
import {
  SonnerImpl1,
  SonnerImpl2,
  SonnerImpl3,
  SonnerImpl4,
} from '@/mdx/components/sonner/sonner-impl';
import { SonnerSample } from '@/mdx/components/sonner/sonner-sample';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_06_28_Css_Sonner_Toast() {
  const { source } = await getPostContent('2025-06-28-css-sonner-toast-');

  const { content } = await compileMDX({
    source,
    components: {
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
