'use client';

import { GaugeCircle,TrendingDown, TrendingUp } from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';

export type DeltaData = {
  current: number | null;
  previous: number | null;
  delta: number | null;
} | null;

type Props = {
  delta: DeltaData;
  cur: string;
  prev: string;
  versions?: string[];
};

function diffStyle(d: number | null) {
  if (d === null) return { color: 'text-muted-foreground', Icon: GaugeCircle };
  if (d > 0)
    return {
      color: 'text-emerald-600 dark:text-emerald-400',
      Icon: TrendingUp,
    };
  if (d < 0)
    return { color: 'text-rose-600 dark:text-rose-400', Icon: TrendingDown };
  return { color: 'text-muted-foreground', Icon: GaugeCircle };
}

export function VersionDeltaCards({ delta, cur, prev }: Props) {
  if (!delta) {
    return (
      <p className="bg-destructive/10 text-destructive rounded-md p-2 text-sm">
        데이터를 불러오지 못했습니다.
      </p>
    );
  }

  const { current, previous, delta: diff } = delta;
  const sign = diff !== null && diff >= 0 ? '+' : '';
  const { color, Icon } = diffStyle(diff);

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key="cards-wrapper"
        layout
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      >
        <motion.div
          key="current"
          layout
          layoutId="currentCard"
          className="bg-background flex flex-col items-center justify-center rounded-xl border p-4 shadow-sm dark:border-zinc-800"
        >
          <GaugeCircle className="text-primary mb-1 h-5 w-5" />
          <div
            className="text-muted-foreground max-w-[90%] truncate text-xs"
            title={cur}
          >
            {cur}
          </div>
          <div className="text-3xl font-semibold tabular-nums">
            {current?.toFixed ? current.toFixed(1) : '—'}
          </div>
        </motion.div>

        <motion.div
          key="previous"
          layout
          layoutId="prevCard"
          className="bg-background flex flex-col items-center justify-center rounded-xl border p-4 shadow-sm dark:border-zinc-800"
        >
          <GaugeCircle className="text-muted-foreground mb-1 h-5 w-5" />
          <div
            className="text-muted-foreground max-w-[90%] truncate text-xs"
            title={prev}
          >
            {prev}
          </div>
          <div className="text-3xl font-semibold tabular-nums">
            {previous?.toFixed ? previous.toFixed(1) : '—'}
          </div>
        </motion.div>

        <motion.div
          key="delta"
          layout
          layoutId="deltaCard"
          className="col-span-2 flex flex-col items-center justify-center rounded-xl border p-4 shadow-sm sm:col-span-1 dark:border-zinc-800"
        >
          <Icon className={`${color} mb-1 h-5 w-5`} />
          <div className="text-muted-foreground text-xs">Δ (cur - prev)</div>
          <div className={`text-3xl font-semibold tabular-nums ${color}`}>
            {diff !== null ? `${sign}${diff.toFixed(1)}` : '—'}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
