'use client';

import { motion } from 'motion/react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '../ui/chart';

export type PerfChartDatum = {
  name: string;
  past: number;
  recent: number;
};

const chartConfig = {
  past: {
    label: '7일전',
    color: 'var(--chart-3)',
  },
  recent: {
    label: '최근',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export default function PerfBarChart({ data }: { data: PerfChartDatum[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-72 w-full"
    >
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={data} barGap={8}>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted-foreground/20"
          />
          <XAxis dataKey="name" className="fill-muted-foreground text-xs" />
          <YAxis
            className="fill-muted-foreground text-xs"
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Bar dataKey="past" radius={[4, 4, 0, 0]} fill="var(--color-past)" />
          <Bar
            dataKey="recent"
            radius={[4, 4, 0, 0]}
            fill="var(--color-recent)"
          />
        </BarChart>
      </ChartContainer>
    </motion.div>
  );
}
