'use client';

import { useQuery } from '@tanstack/react-query';
import { VitalCard } from '@/components/report/vital-card';
import {
  fetchRumOverviewStats,
  RumOverviewStat,
} from '@/lib/server/fetch-rum-overview';

export function VitalGrid({}: { routes: string[] }) {
  const { data = [] } = useQuery<RumOverviewStat[]>({
    queryKey: ['rumOverview', '24h'],
    queryFn: () => fetchRumOverviewStats(24),
    staleTime: 300_000,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data
        .filter((s) => !s.route.startsWith('/report'))
        .map((s) => (
          <VitalCard key={s.route} stat={s} />
        ))}
    </div>
  );
}
