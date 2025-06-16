import { Suspense } from 'react';
import { getDashboardKpi } from '@/actions/report.action';
import { MetricCards } from '@/components/report/metric-cards';
import { SeriesSection } from '@/components/report/series-section';
import { SlowRouteSection } from '@/components/report/slow-route-section';
import { VersionDeltaSection } from '@/components/report/version-detail-section';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ReportPage(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range ?? '7d') as '24h' | '7d' | '30d';
  const version = searchParams.version ?? 'latest';

  const kpi = await getDashboardKpi({ range, version });

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 md:px-6 lg:px-8">
      {kpi.success ? (
        <MetricCards data={kpi.data} />
      ) : (
        <p className="text-destructive">KPI 로딩 실패</p>
      )}

      <Suspense fallback={<Skeleton className="h-[180px] w-full rounded-xl" />}>
        <VersionDeltaSection cur={version} prev="previous" />
      </Suspense>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Suspense
          fallback={<Skeleton className="h-[300px] w-full rounded-xl" />}
        >
          <SeriesSection range={range} version={version} />
        </Suspense>
        <Suspense
          fallback={<Skeleton className="h-[260px] w-full rounded-xl" />}
        >
          <SlowRouteSection range={range} version={version} />
        </Suspense>
      </div>
    </main>
  );
}
