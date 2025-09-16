import { compileMDX } from 'next-mdx-remote/rsc';
import { AuctionSimulator } from '@/mdx/components/cache/auction-simulator';
import { CacheDescription } from '@/mdx/components/cache/cache-description';
import { CacheStrategyQuiz } from '@/mdx/components/cache/cache-strategy-quiz';
import { NetworkSimulator } from '@/mdx/components/cache/network-simulator';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_08_24_Nextjs_Cache() {
  const { source } = await getPostContent('2025-08-24-nextjs-cache');

  const { content } = await compileMDX({
    source,
    components: {
      CacheDescription,
      NetworkSimulator,
      AuctionSimulator,
      CacheStrategyQuiz,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
