import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { fetchPerfLast24h } from '@/lib/fetch-perf';
import { PerfDashboard } from '@/components/report/perf-dashboard';

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
