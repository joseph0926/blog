'use client';

import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';

type KPIData = {
  dbDurAvg: number | null;
  perfAvg: {
    score: number | null;
    lcp: number | null;
    cls: number | null;
    inp: number | null;
  };
};

type MetricCardsProps = {
  kpi: KPIData | null;
};

const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function MetricCards({ kpi }: MetricCardsProps) {
  if (!kpi)
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="h-24 animate-pulse" />
        ))}
      </div>
    );

  const { dbDurAvg, perfAvg } = kpi;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="flex flex-col gap-1 p-4">
        <span className="text-muted-foreground text-sm">DB 평균 지연(ms)</span>
        <motion.span
          key={dbDurAvg ?? '-'}
          {...fadeUp}
          className="text-3xl font-semibold tabular-nums"
        >
          {dbDurAvg !== null ? dbDurAvg.toFixed(1) : '-'}
        </motion.span>
      </Card>
      <Card className="flex flex-col gap-1 p-4">
        <span className="text-muted-foreground text-sm">PerfScore</span>
        <motion.span
          key={perfAvg.score ?? '-'}
          {...fadeUp}
          className="text-3xl font-semibold tabular-nums"
        >
          {perfAvg.score !== null ? perfAvg.score.toFixed(2) : '-'}
        </motion.span>
      </Card>
      <Card className="flex flex-col gap-1 p-4">
        <span className="text-muted-foreground text-sm">LCP / CLS / INP</span>
        <motion.span
          key={`${perfAvg.lcp}-${perfAvg.cls}-${perfAvg.inp}`}
          {...fadeUp}
          className="text-lg tabular-nums"
        >
          {[
            perfAvg.lcp !== null ? perfAvg.lcp.toFixed(2) : '-',
            perfAvg.cls !== null ? perfAvg.cls.toFixed(3) : '-',
            perfAvg.inp !== null ? perfAvg.inp.toFixed(2) : '-',
          ].join(' / ')}
        </motion.span>
      </Card>
    </div>
  );
}
