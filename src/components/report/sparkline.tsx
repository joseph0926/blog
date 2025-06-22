'use client';

import { Sparklines, SparklinesLine } from 'react-sparklines';

export function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null;
  return (
    <Sparklines data={data} width={120} height={30} margin={4}>
      <SparklinesLine style={{ strokeWidth: 1, fill: 'none' }} />
    </Sparklines>
  );
}
