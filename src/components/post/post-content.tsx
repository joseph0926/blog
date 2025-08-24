import { compileMDX } from 'next-mdx-remote/rsc';
import {
  AuctionSimulator,
  CacheDescription,
  CacheStrategyQuiz,
  FiberWrapper,
  NetworkSimulator,
  PerformanceComparisonDemo,
  SonnerImpl1,
  SonnerImpl2,
  SonnerImpl3,
  SonnerImpl4,
  SonnerSample,
  StackReconciler,
  SuspenseDemo,
  SuspenseTransitionDemo,
  SyncVsAsyncDemo,
  TraditionalLoadingDemo,
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
      SyncVsAsyncDemo,
      TraditionalLoadingDemo,
      SuspenseDemo,
      SuspenseTransitionDemo,
      PerformanceComparisonDemo,
      CacheDescription,
      NetworkSimulator,
      AuctionSimulator,
      CacheStrategyQuiz,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
