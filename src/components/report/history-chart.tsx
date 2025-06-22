'use client';

import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

type Datum = {
  date: string;
  lcp: number | null;
  p95: number | null;
  bundle: number | null;
};

function fillGaps(arr: Datum[], key: keyof Datum) {
  let last: number | null = null;
  return arr.map((d) => {
    const v = d[key] as number | null;
    if (v === null && last !== null) return { ...d, [key]: last };
    if (v !== null) last = v;
    return d;
  });
}

const chartConfig = {
  lcp: {
    label: 'LCP(s)',
    color: 'var(--chart-1)',
  },
  p95: {
    label: 'API p95(ms)',
    color: 'var(--chart-2)',
  },
  bundle: {
    label: 'Bundle KB',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

export default function HistoryChart({ raw }: { raw: Datum[] }) {
  const data = fillGaps(fillGaps(fillGaps(raw, 'lcp'), 'p95'), 'bundle');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-96 w-full"
    >
      <ChartContainer config={chartConfig}>
        <LineChart
          data={data}
          margin={{ top: 16, right: 32, bottom: 8, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted-foreground/20"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(parseISO(v), 'MM/dd')}
            className="fill-muted-foreground text-xs"
          />
          <YAxis
            yAxisId="left"
            domain={['auto', 'auto']}
            className="fill-muted-foreground text-xs"
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={['auto', 'auto']}
            hide
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="lcp"
            name="LCP(s)"
            stroke="#60a5fa"
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="p95"
            name="API p95(ms)"
            stroke="#22c55e"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="bundle"
            name="Bundle KB"
            stroke="#eab308"
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </motion.div>
  );
}
