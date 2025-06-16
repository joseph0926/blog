'use client';

import { format, parseISO } from 'date-fns';
import { CartesianGrid,Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { cn } from '@/lib/utils';

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
    label: '평균',
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

  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
      <LineChart
        accessibilityLayer
        data={series}
        margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
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
        <ChartTooltip
          content={<ChartTooltipContent />}
          formatter={(_v, name, item) => (
            <>
              <div
                className={cn(
                  'size-2 shrink-0 rounded-[2px] border-[1.5px] border-dashed border-(--color-border) bg-(--color-bg)',
                )}
                style={
                  {
                    '--color-bg': chartConfig[item.name as 'avg' | 'p95'].color,
                    '--color-border':
                      chartConfig[item.name as 'avg' | 'p95'].color,
                  } as React.CSSProperties
                }
              />
              <div
                className={cn(
                  'flex flex-1 justify-between leading-none',
                  name ? 'items-end' : 'items-center',
                )}
              >
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">
                    {item.name === 'avg' ? '평균' : 'p95'}
                  </span>
                </div>
                {item.value && (
                  <span className="text-foreground font-mono font-medium tabular-nums">
                    {nf.format(Number(item.value))}
                  </span>
                )}
              </div>
            </>
          )}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="var(--color-avg)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="p95"
          stroke="var(--color-p95)"
          strokeWidth={2}
          strokeDasharray="4 2"
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
