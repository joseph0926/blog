import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { PerfDashboard } from '@/components/report/perf-dashboard';
import { fetchPerfLast24h } from '@/lib/fetch-perf';

export default async function ReportHome() {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['perf', '/posts'],
    queryFn: () => fetchPerfLast24h('/posts'),
    staleTime: 5 * 60_000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PerfDashboard route="/posts" />
    </HydrationBoundary>
  );
}
