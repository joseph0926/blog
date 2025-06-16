import { getTimeSeries } from '@/actions/report.action';
import { TimeSeriesChart } from './time-series-chart';

type Props = {
  range: '24h' | '7d' | '30d';
};

export default async function SeriesSection({ range }: Props) {
  const series = await getTimeSeries(range);
  if (!series.success || !series.data) {
    return (
      <div className="bg-muted/50 text-muted-foreground flex h-[280px] w-full items-center justify-center rounded-xl text-sm">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <section className="space-y-2">
      <h2 className="text-base leading-none font-semibold tracking-tight">
        DB 지연 추세 ({range})
      </h2>
      <TimeSeriesChart series={series.data?.series} />
    </section>
  );
}
