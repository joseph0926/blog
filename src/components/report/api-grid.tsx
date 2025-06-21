'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiCard } from '@/components/report/api-card';
import {
  ApiOverviewStat,
  fetchApiOverviewStats,
} from '@/lib/server/fetch-api-overview';

export function ApiGrid({ routes }: { routes: string[] }) {
  const { data = [] } = useQuery<ApiOverviewStat[]>({
    queryKey: ['apiOverview', '24h'],
    queryFn: () => fetchApiOverviewStats(24),
    staleTime: 300_000,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data
        .filter((s) => routes.includes(s.route))
        .map((s) => (
          <ApiCard key={s.route} stat={s} />
        ))}
    </div>
  );
}
