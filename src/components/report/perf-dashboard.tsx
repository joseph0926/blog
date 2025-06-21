'use client';

import { useQuery } from '@tanstack/react-query';
import { addHours, format, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { fetchPerf } from '@/lib/server/fetch-perf';

const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;

const metrics = {
  latency: {
    keys: ['p95Req', 'p99Req'],
    unit: 'ms',
    title: '요청 지연 p95/p99',
  },
  db: { keys: ['p95Db', 'p99Db'], unit: 'ms', title: 'DB 지연 p95/p99' },
  error: { keys: ['errRate'], unit: '%', title: '에러율' },
  rps: { keys: ['rps'], unit: 'RPS', title: '처리량(RPS)' },
} as const;

type Range = keyof typeof hourMap;
type Metric = keyof typeof metrics;

export function PerfDashboard({
  route,
  initialRange = '7d',
  initialMetric = 'latency',
}: {
  route: string;
  initialRange?: '24h' | '7d' | '30d';
  initialMetric?: 'latency' | 'db' | 'error' | 'rps';
}) {
  const router = useRouter();

  const [range, setRange] = useState(initialRange);
  const [metric, setMetric] = useState(initialMetric);

  const { data = [] } = useQuery({
    queryKey: ['perf', route, range],
    queryFn: () => fetchPerf(route, hourMap[range]),
    staleTime: 5 * 60_000,
    select: (rows) => {
      return rows
        .map((r) => ({
          ...r,
          errRate: +((r.err / r.count) * 100).toFixed(2),
          rps: +(r.count / (5 * 60)).toFixed(2),
        }))
        .sort((a, b) => a.ts - b.ts);
    },
  });

  const filtered = useMemo(() => {
    if (range === '24h') return data;
    const from = Date.now() - hourMap[range] * 3_600_000;
    return data.filter((d) => d.ts >= from);
  }, [data, range]);

  const xTicks = useMemo(() => {
    if (range === '24h') return undefined;
    const days = range === '7d' ? 7 : 30;
    const start = startOfDay(Date.now() - (days - 1) * 86_400_000);
    return Array.from({ length: days }, (_, i) => +addHours(start, i * 24));
  }, [range]);

  const chartCfg: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    metrics[metric].keys.forEach((k) => {
      cfg[k as keyof typeof cfg] = {
        label: k,
        color: k.includes('p95')
          ? 'blue'
          : k.includes('p99')
            ? 'green'
            : k.includes('err')
              ? 'red'
              : 'purple',
      };
    });
    return cfg;
  }, [metric]);

  useEffect(() => {
    router.replace(`?range=${range}&metric=${metric}`, { scroll: false });
  }, [range, metric]);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">
        {route} - 최근 {range} {metrics[metric].title}
      </h2>

      <div className="flex gap-2">
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="24h" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 시간</SelectItem>
            <SelectItem value="7d">7 일</SelectItem>
            <SelectItem value="30d">30 일</SelectItem>
          </SelectContent>
        </Select>

        <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="latency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latency">Latency</SelectItem>
            <SelectItem value="db">DB</SelectItem>
            <SelectItem value="error">Error Rate</SelectItem>
            <SelectItem value="rps">RPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="pt-0">
        <CardHeader className="border-b py-4">
          <CardTitle>{metrics[metric].title}</CardTitle>
          <CardDescription>range: {range}</CardDescription>
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={chartCfg} className="h-[260px] w-full">
            <LineChart data={filtered}>
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="ts"
                type="number"
                scale="time"
                domain={['auto', 'auto']}
                ticks={xTicks}
                tickFormatter={(v) =>
                  range === '24h' ? format(v, 'HH:mm') : format(v, 'MM-dd')
                }
              />

              <YAxis
                unit={metrics[metric].unit}
                tickLine={false}
                axisLine={false}
                domain={[
                  (min: number) => Math.floor(min * 0.95),
                  (max: number) => Math.ceil(max * 1.05),
                ]}
                tickCount={4}
              />

              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />

              {metrics[metric].keys.map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={`var(--color-${k})`}
                  dot={false}
                  strokeDasharray={k.includes('p99') ? '4 2' : undefined}
                  strokeWidth={2}
                />
              ))}

              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
