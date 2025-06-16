'use client';

import { GaugeCircle, Server,Timer, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface PerfAvg {
  score: number | null;
  cls: number | null;
  lcp: number | null;
  inp: number | null;
}
interface KpiData {
  dbDurAvg: number | null;
  perfAvg: PerfAvg;
}

const METRICS = [
  {
    key: 'dbDurAvg',
    label: 'DB Avg (ms)',
    icon: <Server className="h-4 w-4" />,
    formatter: (v: number | null) => (v ? v.toFixed(1) : '—'),
    path: (d: KpiData) => d.dbDurAvg,
  },
  {
    key: 'score',
    label: 'Perf Score',
    icon: <GaugeCircle className="h-4 w-4" />,
    formatter: (v: number | null) => (v ? (v * 100).toFixed(0) + '%' : '—'),
    path: (d: KpiData) => d.perfAvg.score,
  },
  {
    key: 'cls',
    label: 'CLS',
    icon: <GaugeCircle className="h-4 w-4" />,
    formatter: (v: number | null) => (v ? v.toFixed(4) : '—'),
    path: (d: KpiData) => d.perfAvg.cls,
  },
  {
    key: 'lcp',
    label: 'LCP (ms)',
    icon: <Timer className="h-4 w-4" />,
    formatter: (v: number | null) => (v ? v.toFixed(1) : '—'),
    path: (d: KpiData) => d.perfAvg.lcp,
  },
  {
    key: 'inp',
    label: 'INP (ms)',
    icon: <Zap className="h-4 w-4" />,
    formatter: (v: number | null) => (v ? v.toFixed(1) : '—'),
    path: (d: KpiData) => d.perfAvg.inp,
  },
] as const;

type MetricKey = (typeof METRICS)[number]['key'];

export function MetricCards({ data }: { data: KpiData | null }) {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-5">
      {METRICS.map(({ key, label, icon, formatter, path }) => {
        const value = data ? path(data) : null;
        return (
          <motion.div
            key={key as MetricKey}
            layout
            layoutId={`metric-${key}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-card rounded-xl border p-4 shadow-sm dark:border-zinc-800"
          >
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              {icon}
              {label}
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums">
              {formatter(value)}
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
