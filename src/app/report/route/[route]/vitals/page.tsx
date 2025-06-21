import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { WebVitalsDashboard } from '@/components/report/web-vitals-dashboard';
import { fetchRumSeries } from '@/lib/server/fetch-rum-series';

const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;
type RangeKey = keyof typeof hourMap;
type MetricKey = 'lcp' | 'fcp' | 'ttfb' | 'inp' | 'cls';

export default async function RouteVitalsPage(props: {
  params: Promise<{ route: string }>;
  searchParams: Promise<{ range?: RangeKey; metric?: MetricKey }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const route =
    params.route === 'Home' ? '/' : decodeURIComponent(params.route);
  if (!route) notFound();

  const range: RangeKey = searchParams.range ?? '7d';
  const metric: MetricKey = searchParams.metric ?? 'lcp';

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['vitalSeries', route, range],
    queryFn: () => fetchRumSeries(route, hourMap[range]),
    staleTime: 300_000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <WebVitalsDashboard key={`${route}-${range}-${metric}`} route={route} />
    </HydrationBoundary>
  );
}
