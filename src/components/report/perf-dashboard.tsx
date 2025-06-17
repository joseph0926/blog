'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPerfLast24h } from '@/lib/fetch-perf';
import { PerfLatencyCard } from '@/components/report/perf-chart';

export function PerfDashboard({ route }: { route: string }) {
  const { data = [] } = useQuery({
    queryKey: ['perf', route],
    queryFn: () => fetchPerfLast24h(route),
  });

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">/posts 최근 24h 지연</h2>
      <PerfLatencyCard data={data} />
    </section>
  );
}
