'use client';

import * as React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

type Pt = { bucket: string | Date; p95req: number; p99req: number };

const chartCfg = {
  p95req: { label: 'p95', color: 'var(--chart-1)' },
  p99req: { label: 'p99', color: 'var(--chart-2)' },
} satisfies ChartConfig;

export function PerfLatencyCard({ data }: { data: Pt[] }) {
  const [range, setRange] = React.useState<'24h' | '7d' | '30d'>('24h');

  const filtered = React.useMemo(() => {
    if (range === '24h') return data;
    const hours = range === '7d' ? 24 * 7 : 24 * 30;
    const from = Date.now() - hours * 3_600_000;
    return data.filter((d) => new Date(d.bucket).getTime() >= from);
  }, [data, range]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>요청 지연 - p95 / p99</CardTitle>
          <CardDescription>최근 {range} 지표</CardDescription>
        </div>

        <Select value={range} onValueChange={(v) => setRange(v as any)}>
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
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => format(new Date(v), 'HH:mm')}
            />
            <YAxis unit="ms" tickLine={false} axisLine={false} />

            <ChartTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={
                <ChartTooltipContent
                  labelFormatter={(v) =>
                    format(new Date(v as string), 'yy-MM-dd HH:mm')
                  }
                  indicator="dot"
                />
              }
            />

            <Line
              type="monotone"
              dataKey="p95req"
              stroke="var(--color-p95req, var(--chart-1))"
              dot={false}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="p99req"
              stroke="var(--color-p99req, var(--chart-2))"
              dot={false}
              strokeDasharray="4 2"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
