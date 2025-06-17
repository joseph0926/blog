'use client';

import { format } from 'date-fns';
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
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPerf } from '@/lib/fetch-perf';

const chartCfg = {
  p95req: { label: 'p95', color: 'blue' },
  p99req: { label: 'p99', color: 'green' },
} satisfies ChartConfig;

const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;

export function PerfDashboard({ route }: { route: string }) {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');

  const { data = [] } = useQuery({
    queryKey: ['perf', route, range],
    queryFn: () => fetchPerf(route, hourMap[range]),
    staleTime: 5 * 60_000,
    select: (raw) => {
      const seen = new Set<number>();
      return raw
        .map((r) => ({
          ts: Number(r.ts),
          p95req: +r.p95req,
          p99req: +r.p99req,
        }))
        .filter((r) => {
          const key = Math.floor(r.ts / 1000);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .sort((a, b) => a.ts - b.ts);
    },
  });

  const filtered = useMemo(() => {
    if (range === '24h') return data;
    const from = Date.now() - hourMap[range] * 3_600_000;
    return data.filter((d) => d.ts >= from);
  }, [data, range]);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">
        홈 (Recent Posts) 최근 {range} 지연
      </h2>
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>요청 지연 - p95 / p99</CardTitle>
            <CardDescription>최근 {range} 지표</CardDescription>
          </div>

          <Select
            value={range}
            onValueChange={(v) => setRange(v as '24h' | '7d' | '30d')}
          >
            <SelectTrigger className="hidden w-[120px] sm:flex">
              <SelectValue placeholder="24h" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">최근 24시간</SelectItem>
              <SelectItem value="7d">최근 7일</SelectItem>
              <SelectItem value="30d">최근 30일</SelectItem>
            </SelectContent>
          </Select>
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
                tickFormatter={(v) => format(v, 'HH:mm')}
              />
              <YAxis
                unit="ms"
                tickLine={false}
                axisLine={false}
                domain={[
                  (dataMin: number) => Math.floor(dataMin * 0.95),
                  (dataMax: number) => Math.ceil(dataMax * 1.05),
                ]}
                tickCount={4}
              />

              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="dot" />}
              />

              <Line
                type="monotone"
                dataKey="p95req"
                stroke="var(--color-p95req)"
                dot={false}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="p99req"
                stroke="var(--color-p99req)"
                dot={false}
                strokeDasharray="4 2"
              />

              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
