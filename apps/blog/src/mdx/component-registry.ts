import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;
type Loader = () => Promise<AnyComponent>;

const cache = new Map<string, Promise<AnyComponent>>();

function cached(name: string, loader: Loader): Loader {
  return () => {
    const hit = cache.get(name);
    if (hit) return hit;
    const p = loader();
    cache.set(name, p);
    return p;
  };
}

export const MDX_COMPONENT_LOADERS = {
  StackReconciler: cached('StackReconciler', async () => {
    const m = await import('@/mdx/components/stack-reconciler');
    return m.StackReconciler;
  }),
  FiberWrapper: cached('FiberWrapper', async () => {
    const m = await import('@/mdx/components/fiber/fiber-wrapper');
    return m.FiberWrapper;
  }),

  SonnerSample: cached('SonnerSample', async () => {
    const m = await import('@/mdx/components/sonner/sonner-sample');
    return m.SonnerSample;
  }),
  SonnerImpl1: cached('SonnerImpl1', async () => {
    const m = await import('@/mdx/components/sonner/sonner-impl');
    return m.SonnerImpl1;
  }),
  SonnerImpl2: cached('SonnerImpl2', async () => {
    const m = await import('@/mdx/components/sonner/sonner-impl');
    return m.SonnerImpl2;
  }),
  SonnerImpl3: cached('SonnerImpl3', async () => {
    const m = await import('@/mdx/components/sonner/sonner-impl');
    return m.SonnerImpl3;
  }),
  SonnerImpl4: cached('SonnerImpl4', async () => {
    const m = await import('@/mdx/components/sonner/sonner-impl');
    return m.SonnerImpl4;
  }),

  SyncVsAsyncDemo: cached('SyncVsAsyncDemo', async () => {
    const m = await import('@/mdx/components/suspense/sync-vs-async-demo');
    return m.SyncVsAsyncDemo;
  }),
  TraditionalLoadingDemo: cached('TraditionalLoadingDemo', async () => {
    const m =
      await import('@/mdx/components/suspense/traditional-loading-demo');
    return m.TraditionalLoadingDemo;
  }),
  SuspenseDemo: cached('SuspenseDemo', async () => {
    const m = await import('@/mdx/components/suspense/suspense-demo');
    return m.SuspenseDemo;
  }),
  SuspenseTransitionDemo: cached('SuspenseTransitionDemo', async () => {
    const m =
      await import('@/mdx/components/suspense/suspense-transition-demo');
    return m.SuspenseTransitionDemo;
  }),
  PerformanceComparisonDemo: cached('PerformanceComparisonDemo', async () => {
    const m = await import('@/mdx/components/suspense/perf-compare-demo');
    return m.PerformanceComparisonDemo;
  }),

  CacheDescription: cached('CacheDescription', async () => {
    const m = await import('@/mdx/components/cache/cache-description');
    return m.CacheDescription;
  }),
  NetworkSimulator: cached('NetworkSimulator', async () => {
    const m = await import('@/mdx/components/cache/network-simulator');
    return m.NetworkSimulator;
  }),
  AuctionSimulator: cached('AuctionSimulator', async () => {
    const m = await import('@/mdx/components/cache/auction-simulator');
    return m.AuctionSimulator;
  }),
  CacheStrategyQuiz: cached('CacheStrategyQuiz', async () => {
    const m = await import('@/mdx/components/cache/cache-strategy-quiz');
    return m.CacheStrategyQuiz;
  }),

  ProxyTrack: cached('ProxyTrack', async () => {
    const m = await import('@/mdx/components/react-query/proxy-track');
    return m.ProxyTrack;
  }),

  Counter: cached('Counter', async () => {
    const m = await import('@/mdx/components/use-state/counter');
    return m.Counter;
  }),
  CounterFn: cached('CounterFn', async () => {
    const m = await import('@/mdx/components/use-state/counter');
    return m.CounterFn;
  }),

  SyncExternalStoreDemo: cached('SyncExternalStoreDemo', async () => {
    const m =
      await import('@/mdx/components/local-first/sync-external-store-demo');
    return m.SyncExternalStoreDemo;
  }),
  MemoryCachePatternDemo: cached('MemoryCachePatternDemo', async () => {
    const m =
      await import('@/mdx/components/local-first/memory-cache-pattern-demo');
    return m.MemoryCachePatternDemo;
  }),
  AutoSyncComparison: cached('AutoSyncComparison', async () => {
    const m = await import('@/mdx/components/local-first/auto-sync-comparison');
    return m.AutoSyncComparison;
  }),

  ProfilerResult: cached('ProfilerResult', async () => {
    const m = await import('@/mdx/components/url/profiler-result');
    return m.ProfilerResult;
  }),
  ServiceComparison: cached('ServiceComparison', async () => {
    const m = await import('@/mdx/components/url/service-comparison');
    return m.ServiceComparison;
  }),
  BackButtonDemo: cached('BackButtonDemo', async () => {
    const m = await import('@/mdx/components/url/back-button-demo');
    return m.BackButtonDemo;
  }),

  CodeTransformAnimation: cached('CodeTransformAnimation', async () => {
    const m =
      await import('@/mdx/components/rsc-build/code-transform-animation');
    return m.CodeTransformAnimation;
  }),
  RSCPayloadVisualization: cached('RSCPayloadVisualization', async () => {
    const m =
      await import('@/mdx/components/rsc-build/rsc-payload-visualization');
    return m.RSCPayloadVisualization;
  }),
  HydrationTimeline: cached('HydrationTimeline', async () => {
    const m = await import('@/mdx/components/rsc-build/hydration-timeline');
    return m.HydrationTimeline;
  }),
  BundleSplitDiagram: cached('BundleSplitDiagram', async () => {
    const m = await import('@/mdx/components/rsc-build/bundle-split-diagram');
    return m.BundleSplitDiagram;
  }),
  BundleSizeComparison: cached('BundleSizeComparison', async () => {
    const m = await import('@/mdx/components/rsc-build/bundle-size-comparison');
    return m.BundleSizeComparison;
  }),
} as const;

type Registered = keyof typeof MDX_COMPONENT_LOADERS;

export async function getMdxComponentsForSource(
  source: string,
): Promise<MDXComponents> {
  const re = /<([A-Z][A-Za-z0-9_]*)\b/g;
  const used = new Set<Registered>();

  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const name = match[1] as Registered;
    if (name in MDX_COMPONENT_LOADERS) used.add(name);
  }

  const entries = await Promise.all(
    [...used].map(
      async (name) => [name, await MDX_COMPONENT_LOADERS[name]()] as const,
    ),
  );

  return Object.fromEntries(entries) as MDXComponents;
}
