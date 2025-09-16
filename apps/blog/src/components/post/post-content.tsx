import { MDXComponents } from 'mdx/types';
import { compileMDX } from 'next-mdx-remote/rsc';
import { POST_COMPONENT_MAP } from '@/constants/post-components-map';
import { getPostContent } from '@/services/post.service';

const COMPONENT_LOADERS = {
  StackReconciler: () =>
    import('@/mdx/components/stack-reconciler').then((m) => m.StackReconciler),
  FiberWrapper: () =>
    import('@/mdx/components/fiber/fiber-wrapper').then((m) => m.FiberWrapper),

  SonnerSample: () =>
    import('@/mdx/components/sonner/sonner-sample').then((m) => m.SonnerSample),
  SonnerImpl1: () =>
    import('@/mdx/components/sonner/sonner-impl').then((m) => m.SonnerImpl1),
  SonnerImpl2: () =>
    import('@/mdx/components/sonner/sonner-impl').then((m) => m.SonnerImpl2),
  SonnerImpl3: () =>
    import('@/mdx/components/sonner/sonner-impl').then((m) => m.SonnerImpl3),
  SonnerImpl4: () =>
    import('@/mdx/components/sonner/sonner-impl').then((m) => m.SonnerImpl4),

  SyncVsAsyncDemo: () =>
    import('@/mdx/components/suspense/sync-vs-async-demo').then(
      (m) => m.SyncVsAsyncDemo,
    ),
  TraditionalLoadingDemo: () =>
    import('@/mdx/components/suspense/traditional-loading-demo').then(
      (m) => m.TraditionalLoadingDemo,
    ),
  SuspenseDemo: () =>
    import('@/mdx/components/suspense/suspense-demo').then(
      (m) => m.SuspenseDemo,
    ),
  SuspenseTransitionDemo: () =>
    import('@/mdx/components/suspense/suspense-transition-demo').then(
      (m) => m.SuspenseTransitionDemo,
    ),
  PerformanceComparisonDemo: () =>
    import('@/mdx/components/suspense/perf-compare-demo').then(
      (m) => m.PerformanceComparisonDemo,
    ),

  CacheDescription: () =>
    import('@/mdx/components/cache/cache-description').then(
      (m) => m.CacheDescription,
    ),
  NetworkSimulator: () =>
    import('@/mdx/components/cache/network-simulator').then(
      (m) => m.NetworkSimulator,
    ),
  AuctionSimulator: () =>
    import('@/mdx/components/cache/auction-simulator').then(
      (m) => m.AuctionSimulator,
    ),
  CacheStrategyQuiz: () =>
    import('@/mdx/components/cache/cache-strategy-quiz').then(
      (m) => m.CacheStrategyQuiz,
    ),

  ProxyTrack: () =>
    import('@/mdx/components/react-query/proxy-track').then(
      (m) => m.ProxyTrack,
    ),
} as const;

async function loadComponentsForPost(slug: string) {
  const componentNames = POST_COMPONENT_MAP[slug] || [];

  if (componentNames.length === 0) {
    return {};
  }

  const components: MDXComponents | null | undefined = {};

  await Promise.all(
    componentNames.map(async (name) => {
      const loader = COMPONENT_LOADERS[name as keyof typeof COMPONENT_LOADERS];
      if (loader) {
        try {
          components[name] = await loader();
        } catch (error) {
          console.error(`Failed to load component ${name}:`, error);
        }
      }
    }),
  );

  return components;
}

export async function PostContent({ slug }: { slug: string }) {
  const { source } = await getPostContent(slug);
  const components = await loadComponentsForPost(slug);

  const { content } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: true },
  });

  return content;
}
