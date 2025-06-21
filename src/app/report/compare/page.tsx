import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import ComparePerfDashboard from '@/components/report/compare-perf-dashboard';
import { fetchPerf } from '@/lib/server/fetch-perf';
import { fetchRoutes } from '@/lib/server/fetch-routes';

const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;
type RangeKey = keyof typeof hourMap;

export default async function ComparePage(props: {
  searchParams: Promise<{
    routes?: string;
    range?: RangeKey;
    metric?: 'latency' | 'db';
  }>;
}) {
  const searchParams = await props.searchParams;
  const routes = (searchParams.routes ?? '').split(',').filter(Boolean);
  if (routes.length < 2) notFound();

  const range: RangeKey = searchParams.range ?? '7d';
  const qc = new QueryClient();

  const allRoutes = await fetchRoutes();

  await Promise.all(
    routes.map((r) =>
      qc.prefetchQuery({
        queryKey: ['perf', r, range],
        queryFn: () => fetchPerf(r, hourMap[range]),
        staleTime: 5 * 60_000,
      }),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ComparePerfDashboard
        initialRoutes={routes}
        initialRange={range}
        initialMetric={searchParams.metric ?? 'latency'}
        allRoutes={allRoutes}
      />
    </HydrationBoundary>
  );
}
