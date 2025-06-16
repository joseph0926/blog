import { Suspense } from 'react';
// import { SlowRouteSection } from '@/components/report/slow-route-section';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardKpi, getTopSlowRoutes } from '@/actions/report.action';
import { MetricCards } from '@/components/report/metric-cards';
import SeriesSection from '@/components/report/series-section';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ReportPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const range = (searchParams.range ?? '24h') as '24h' | '7d' | '30d';

  const kpiRes = await getDashboardKpi(range);
  const slowPromise = getTopSlowRoutes(range, 5);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 p-6">
      {kpiRes.success ? (
        <MetricCards kpi={kpiRes.data} />
      ) : (
        <div className="text-destructive p-8">KPI 로딩 실패</div>
      )}
      <Suspense fallback={<Skeleton className="h-[280px] w-full rounded-xl" />}>
        <SeriesSection range={range} />
      </Suspense>
      {/* <Suspense fallback={<Skeleton className="h-[260px] w-full rounded-xl" />}>
        <SlowRouteSection promise={slowPromise} range={range} />
      </Suspense> */}
    </section>
  );
}
