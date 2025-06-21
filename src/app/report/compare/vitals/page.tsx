import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import CompareVitalsDashboard from '@/components/report/compare-vitals-dashboard';
import { fetchRoutes } from '@/lib/server/fetch-routes';
import { fetchRumSeries } from '@/lib/server/fetch-rum-series';

const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;
type RangeKey = keyof typeof hourMap;
type MetricKey = 'lcp' | 'fcp' | 'ttfb' | 'inp' | 'cls';

export default async function CompareVitalsPage(props: {
  searchParams: Promise<{
    routes?: string;
    range?: RangeKey;
    metric?: MetricKey;
  }>;
}) {
  const searchParams = await props.searchParams;

  const routes = (searchParams.routes ?? '').split(',').filter(Boolean);
  if (routes.length < 2) notFound();

  const range: RangeKey = searchParams.range ?? '7d';
  const metric: MetricKey = searchParams.metric ?? 'lcp';

  const qc = new QueryClient();
  const allRoutes = await fetchRoutes();

  await Promise.all(
    routes.map((r) =>
      qc.prefetchQuery({
        queryKey: ['vitalSeries', r, range],
        queryFn: () => fetchRumSeries(r, hourMap[range]),
        staleTime: 300_000,
      }),
    ),
  );

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <CompareVitalsDashboard
        initialRoutes={routes}
        initialRange={range}
        initialMetric={metric}
        allRoutes={allRoutes}
      />
    </HydrationBoundary>
  );
}
