import Link from 'next/link';
import { KpiBadge } from '@/components/report/kpi-badge';
import type { PerfChartDatum } from '@/components/report/perf-bar-chart';
import PerfSection from '@/components/report/perf-section';
import { StoryCard } from '@/components/report/story-card';
import { Button } from '@/components/ui/button';
import { getPerfSummary } from '@/lib/server/fetch-perf-summary';

export const revalidate = 1800;

export default async function ReportPage() {
  const data = await getPerfSummary();

  const lcpDelta =
    data.lcpPast && data.lcpRecent
      ? ((data.lcpRecent - data.lcpPast) / data.lcpPast) * 100
      : 0;
  const clsDelta =
    data.clsPast && data.clsRecent
      ? ((data.clsRecent - data.clsPast) / data.clsPast) * 100
      : 0;
  const p95Delta =
    data.p95Past && data.p95Recent
      ? ((data.p95Recent - data.p95Past) / data.p95Past) * 100
      : 0;
  const bundleDelta =
    data.bundlePast && data.bundleRecent
      ? ((data.bundleRecent - data.bundlePast) / data.bundlePast) * 100
      : 0;

  const chartData: PerfChartDatum[] = [
    {
      name: '평균 LCP(s)',
      past: Number((data.lcpPast ?? 0).toFixed(2)),
      recent: Number((data.lcpRecent ?? 0).toFixed(2)),
    },
    {
      name: '평균 CLS',
      past: Number((data.clsPast ?? 0).toFixed(3)),
      recent: Number((data.clsRecent ?? 0).toFixed(3)),
    },
    {
      name: 'API p95(ms)',
      past: Math.round(data.p95Past ?? 0),
      recent: Math.round(data.p95Recent ?? 0),
    },
    {
      name: 'Bundle KB',
      past: Math.round(data.bundlePast ?? 0),
      recent: Math.round(data.bundleRecent ?? 0),
    },
  ];

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <section className="flex gap-3 overflow-x-auto">
          <KpiBadge label="평균 LCP" delta={lcpDelta} />
          <KpiBadge label="평균 CLS" delta={clsDelta} />
          <KpiBadge label="API p95" delta={p95Delta} />
          <KpiBadge label="JS 번들" delta={bundleDelta} />
        </section>
        <Link href="/report/history" className="max-sm:w-full">
          <Button variant="outline" className="cursor-pointer max-sm:w-full">
            자세히 보기
          </Button>
        </Link>
      </div>
      <section className="grid gap-4 sm:grid-cols-2">
        <StoryCard
          title="평균 LCP"
          past={`${(data.lcpPast ?? 0).toFixed(1)}s`}
          recent={`${(data.lcpRecent ?? 0).toFixed(1)}s`}
          delta={lcpDelta}
        />
        <StoryCard
          title="평균 CLS"
          past={`${(data.clsPast ?? 0).toFixed(3)}`}
          recent={`${(data.clsRecent ?? 0).toFixed(3)}`}
          delta={clsDelta}
        />
        <StoryCard
          title="API p95"
          past={`${Math.round(data.p95Past ?? 0)}ms`}
          recent={`${Math.round(data.p95Recent ?? 0)}ms`}
          delta={p95Delta}
        />
        <StoryCard
          title="JS 번들"
          past={`${Math.round(data.bundlePast ?? 0)}KB`}
          recent={`${Math.round(data.bundleRecent ?? 0)}KB`}
          delta={bundleDelta}
        />
      </section>
      <section className="pb-10">
        <PerfSection data={chartData} />
      </section>
    </main>
  );
}
