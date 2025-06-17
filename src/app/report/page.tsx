import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { PerfDashboard } from '@/components/report/perf-dashboard';
import { fetchPerf } from '@/lib/fetch-perf';

export default async function ReportHome() {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['perf', 'getRecentPosts', '24h'],
    queryFn: () => fetchPerf('getRecentPosts', 24),
    staleTime: 5 * 60_000,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <PerfDashboard route="getRecentPosts" />
    </HydrationBoundary>
  );
}
