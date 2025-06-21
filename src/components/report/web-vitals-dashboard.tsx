'use client';

import { useQuery } from '@tanstack/react-query';
import { addHours, format, startOfDay } from 'date-fns';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fetchRumSeries, type VitalRow } from '@/lib/server/fetch-rum-series';

const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;
type Range = keyof typeof hourMap;

const metricMap = {
  lcp: { key: 'p75Lcp', label: 'LCP-p75', unit: 'ms', color: 'blue' },
  fcp: { key: 'p75Fcp', label: 'FCP-p75', unit: 'ms', color: 'green' },
  ttfb: { key: 'p75Ttfb', label: 'TTFB-p75', unit: 'ms', color: 'purple' },
  inp: { key: 'p75Inp', label: 'INP-p75', unit: 'ms', color: 'orange' },
  cls: { key: 'p90Cls', label: 'CLS-p90', unit: '', color: 'red' },
} as const;
type Metric = keyof typeof metricMap;

export function WebVitalsDashboard({ route }: { route: string }) {
  const [range, setRange] = useState<Range>('7d');
  const [metric, setMetric] = useState<Metric>('lcp');

  const { data = [], isFetching } = useQuery<VitalRow[]>({
    queryKey: ['vitalSeries', route, range],
    queryFn: () => fetchRumSeries(route, hourMap[range]),
    staleTime: 300_000,
    select: (rows) => rows.sort((a, b) => a.ts - b.ts),
  });

  const xTicks = useMemo(() => {
    if (range === '24h') return undefined;
    const days = range === '7d' ? 7 : 30;
    const start = startOfDay(Date.now() - (days - 1) * 86_400_000);
    return Array.from({ length: days }, (_, i) => +addHours(start, i * 24));
  }, [range]);

  const cfg: ChartConfig = {
    [metricMap[metric].key]: {
      label: metricMap[metric].label,
      color: metricMap[metric].color,
    },
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">
          {route} · {metricMap[metric].label} · {range}
        </h2>

        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-[96px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 h</SelectItem>
            <SelectItem value="7d">7 d</SelectItem>
            <SelectItem value="30d">30 d</SelectItem>
          </SelectContent>
        </Select>

        <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(metricMap).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v.label.split('-')[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer
        config={cfg}
        className="h-[260px] w-full rounded-lg border"
      >
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['auto', 'auto']}
            ticks={xTicks}
            tickFormatter={(v) =>
              format(v, range === '24h' ? 'HH:mm' : 'MM-dd')
            }
          />
          <YAxis unit={metricMap[metric].unit} />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar
            type="monotone"
            dataKey={metricMap[metric].key}
            stroke={`var(--color-${metricMap[metric].color})`}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>

      {isFetching && <p className="text-muted-foreground text-xs">loading …</p>}
      {!isFetching && data.length === 0 && (
        <p className="text-muted-foreground text-xs">
          No samples for the selected period.
        </p>
      )}
    </section>
  );
}
