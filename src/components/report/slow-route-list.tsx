'use client';

import { motion } from 'motion/react';

type Route = { route: string; avg: number };

export function SlowRouteList({ routes }: { routes: Route[] }) {
  return (
    <ul className="divide-y text-sm">
      {routes.map((r, i) => (
        <motion.li
          key={r.route}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between py-2"
        >
          <span className="max-w-[65%] truncate">
            {i + 1}. {r.route}
          </span>
          <span className="tabular-nums">{r.avg.toFixed(1)} ms</span>
        </motion.li>
      ))}
      {routes.length === 0 && (
        <li className="text-muted-foreground py-4">데이터 없음</li>
      )}
    </ul>
  );
}
