import { compileMDX } from 'next-mdx-remote/rsc';
import { PerformanceComparisonDemo } from '@/mdx/components/suspense/perf-compare-demo';
import { SuspenseDemo } from '@/mdx/components/suspense/suspense-demo';
import { SuspenseTransitionDemo } from '@/mdx/components/suspense/suspense-transition-demo';
import { SyncVsAsyncDemo } from '@/mdx/components/suspense/sync-vs-async-demo';
import { TraditionalLoadingDemo } from '@/mdx/components/suspense/traditional-loading-demo';
import { getPostContent } from '@/services/post.service';

export async function Post_2025_07_13_Learn_React_02_Suspense() {
  const { source } = await getPostContent(
    '2025-07-13-learn-react-02-suspense-',
  );

  const { content } = await compileMDX({
    source,
    components: {
      SyncVsAsyncDemo,
      TraditionalLoadingDemo,
      SuspenseDemo,
      SuspenseTransitionDemo,
      PerformanceComparisonDemo,
    },
    options: { parseFrontmatter: true },
  });

  return content;
}
