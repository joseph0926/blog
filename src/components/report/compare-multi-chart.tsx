'use client';

import {
  type QueryKey,
  useQueries,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { MultiSelect } from '@/components/ui/multi-select';

export const hourMap = { '24h': 24, '7d': 168, '30d': 720 } as const;
export type RangeKey = keyof typeof hourMap;

const palette = ['blue', 'green', 'purple', 'orange', 'red', 'teal'];
const colorOf = (i: number) => `var(--color-${palette[i % palette.length]})`;

type MetricCfg = { key: string; label: string; unit: string };

type BaseProps<TRow extends { ts: number }> = {
  title: string;
  initialRoutes: string[];
  initialRange: RangeKey;

  metric: string;
  metricMap: Record<string, MetricCfg>;

  fetcher: (route: string, hours: number) => Promise<TRow[]>;

  transform: (row: TRow, metricKey: string) => number | null;

  allRoutes: string[];

  queryKeyPrefix: string;

  urlBase: string;

  chartHeight?: number;
};

export function CompareMultiChart<TRow extends { ts: number }>({
  title,
  initialRoutes,
  initialRange,
  metric,
  metricMap,
  fetcher,
  transform,
  allRoutes,
  queryKeyPrefix,
  urlBase,
  chartHeight = 320,
}: BaseProps<TRow>) {
  const [routes, setRoutes] = useState<string[]>(initialRoutes);
  const [range, setRange] = useState<RangeKey>(initialRange);
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `${urlBase}?routes=${routes.join(',')}&range=${range}&metric=${metric}`,
      { scroll: false },
    );
  }, [routes, range, metric, router, urlBase]);

  const queries = useQueries({
    queries: routes.map(
      (
        r,
      ): UseQueryOptions<
        TRow[],
        Error,
        { ts: number; value: number | null }[],
        QueryKey
      > => ({
        queryKey: [queryKeyPrefix, r, range],
        queryFn: () => fetcher(r, hourMap[range]),
        staleTime: 300_000,
        select: (rows) =>
          rows.map((row) => ({
            ts: row.ts,
            value: transform(row, metricMap[metric].key),
          })),
      }),
    ),
  });

  const mergedTs = useMemo(() => {
    const s = new Set<number>();
    queries.forEach((q) => q.data?.forEach((d) => s.add(d.ts)));
    return Array.from(s).sort();
  }, [queries]);

  type ChartRow = { ts: number } & Record<string, number | null>;
  const merged: ChartRow[] = useMemo(
    () =>
      mergedTs.map((ts) => {
        const row: ChartRow = { ts };
        queries.forEach((q, idx) => {
          const val = q.data?.find((d) => d.ts === ts)?.value ?? null;
          row[routes[idx]] = val;
        });
        return row;
      }),
    [mergedTs, queries, routes],
  );

  const chartCfg: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    routes.forEach((r, i) => {
      cfg[r] = { label: r, color: colorOf(i) };
    });
    return cfg;
  }, [routes]);

  const unit = metricMap[metric].unit;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold">
          {title} – {metricMap[metric].label} / {range}
        </h2>

        <MultiSelect values={routes} onChange={setRoutes} options={allRoutes} />

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeKey)}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="24h">24 h</option>
          <option value="7d">7 d</option>
          <option value="30d">30 d</option>
        </select>
      </div>

      <ChartContainer
        config={chartCfg}
        className={`h-[${chartHeight}px] w-full rounded-lg border`}
      >
        <LineChart data={merged}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={['auto', 'auto']}
            tickFormatter={(v) =>
              format(v, range === '24h' ? 'HH:mm' : 'MM-dd')
            }
          />
          <YAxis unit={unit} />
          <ChartTooltip content={<ChartTooltipContent />} />

          {routes.map((r, i) => (
            <Line
              key={r}
              type="monotone"
              dataKey={r}
              stroke={colorOf(i)}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </section>
  );
}
