import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { ApiGrid } from '@/components/report/api-grid';
import { VitalGrid } from '@/components/report/vital-grid';
import { fetchApiOverviewStats } from '@/lib/server/fetch-api-overview';
import { fetchPerf } from '@/lib/server/fetch-perf';
import { fetchRoutes } from '@/lib/server/fetch-routes';
import { fetchRumOverviewStats } from '@/lib/server/fetch-rum-overview';

export default async function ReportHome() {
  const qc = new QueryClient();
  const routes = await fetchRoutes();

  await Promise.all([
    ...routes.map((r) =>
      qc.prefetchQuery({
        queryKey: ['overview', r],
        queryFn: () => fetchPerf(r, 24, 60),
        staleTime: 300_000,
      }),
    ),
    qc.prefetchQuery({
      queryKey: ['apiOverview', '24h'],
      queryFn: () => fetchApiOverviewStats(24),
      staleTime: 300_000,
    }),
    qc.prefetchQuery({
      queryKey: ['rumOverview', '24h'],
      queryFn: () => fetchRumOverviewStats(24),
      staleTime: 300_000,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className="space-y-8">
        <h2 className="text-xl font-semibold">API Overview</h2>
        <ApiGrid routes={routes} />
        <h2 className="text-xl font-semibold">Web Vitals Overview</h2>
        <VitalGrid routes={routes} />
      </section>
    </HydrationBoundary>
  );
}
