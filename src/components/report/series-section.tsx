import { getTimeSeries } from '@/actions/report.action';
import { TimeSeriesChart } from './time-series-chart';

type Props = { range: string; version: string };

export async function SeriesSection({ range, version }: Props) {
  const { data } = await getTimeSeries({ range, version });
  const series = data?.series ?? [];

  return (
    <section className="bg-card rounded-xl border p-4 shadow-sm">
      <h2 className="mb-2 font-medium">DB Duration - avg vs p95</h2>
      <TimeSeriesChart series={series} />
    </section>
  );
}
