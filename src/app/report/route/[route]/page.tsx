import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { PerfDashboard } from '@/components/report/perf-dashboard';
import { fetchPerf } from '@/lib/server/fetch-perf';

const ranges = { '24h': 24, '7d': 168, '30d': 720 } as const;
type RangeKey = keyof typeof ranges;

export default async function RoutePage(props: {
  params: Promise<{ route: string }>;
  searchParams: Promise<{
    range?: RangeKey;
    metric?: 'latency' | 'db' | 'error' | 'rps';
  }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const route = params.route;
  const range: RangeKey = searchParams.range ?? '7d';

  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['perf', route, range],
    queryFn: () => fetchPerf(route, ranges[range]),
    staleTime: 5 * 60_000,
  });
  const dehydrated = dehydrate(qc);
  if (!dehydrated.queries.length) notFound();

  return (
    <HydrationBoundary state={dehydrated}>
      <PerfDashboard
        route={route}
        initialRange={range}
        initialMetric={searchParams.metric ?? 'latency'}
      />
    </HydrationBoundary>
  );
}
