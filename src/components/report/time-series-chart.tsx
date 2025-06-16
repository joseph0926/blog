'use client';

import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useMemo } from 'react';

type Point = {
  day: string;
  avg: number;
  p95: number;
};
type Props = {
  series: Point[];
};

const nf = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
});

const chartConfig = {
  avg: {
    label: 'avg',
    color: 'var(--chart-1)',
  },
  p95: {
    label: 'p95',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function TimeSeriesChart({ series }: Props) {
  if (!series.length)
    return (
      <div className="bg-muted/50 text-muted-foreground flex h-[280px] w-full items-center justify-center rounded-xl text-sm">
        데이터가 없습니다.
      </div>
    );

  const formatSeries = useMemo(() => {
    return series.map((s) => ({
      avg: nf.format(s.avg),
      p95: nf.format(s.p95),
      day: s.day,
    }));
  }, [series]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
      <LineChart
        accessibilityLayer
        data={formatSeries}
        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickMargin={10}
          tickFormatter={(v: string) => format(parseISO(v), 'MM-dd')}
        />
        <YAxis
          width={48}
          tickMargin={8}
          tickFormatter={(v: number) => nf.format(v)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="var(--color-avg)"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="p95"
          stroke="var(--color-p95)"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      </LineChart>
    </ChartContainer>
  );
}
