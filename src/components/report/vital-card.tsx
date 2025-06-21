'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useRouteSelect } from '@/hooks/use-route-select';
import { RumOverviewStat } from '@/lib/server/fetch-rum-overview';
import { cn } from '@/lib/utils';

const TH = { lcp: 4000, fcp: 1800, ttfb: 800, inp: 200, cls: 0.1 };

type Props = { stat: RumOverviewStat };

export function VitalCard({ stat }: Props) {
  const router = useRouter();
  const { selected, toggle } = useRouteSelect();
  const checked = selected.includes(stat.route);
  const niceRoute = stat.route === '/' ? 'Home' : stat.route;

  const navigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(
      `/report/route/${encodeURIComponent(niceRoute)}/vitals?tab=vitals`,
    );
  };

  const onToggle = () => {
    toggle(stat.route);
  };

  return (
    <Card
      role="button"
      onClick={onToggle}
      className={cn(
        'hover:ring-primary/50 relative flex flex-col gap-2 p-4 transition hover:ring-1',
        checked && 'ring-primary ring-1',
      )}
    >
      <div className="absolute top-1 right-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          onClick={onToggle}
          className="size-4 accent-blue-500"
        />

        <Button size="icon" variant="ghost" onClick={navigate} className="">
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>

      <span className="text-sm font-semibold">{niceRoute}</span>

      <CardContent className="grid gap-y-1 p-0 text-sm">
        <Vital label="LCP" unit="ms" value={stat.p75Lcp} threshold={TH.lcp} />
        <Vital label="FCP" unit="ms" value={stat.p75Fcp} threshold={TH.fcp} />
        <Vital
          label="TTFB"
          unit="ms"
          value={stat.p75Ttfb}
          threshold={TH.ttfb}
        />
        <Vital label="INP" unit="ms" value={stat.p75Inp} threshold={TH.inp} />
        <Vital label="CLS" unit="" value={stat.p90Cls} threshold={TH.cls} />
        <Progress
          className="mt-1 h-1"
          value={stat.p75Lcp ? Math.min((stat.p75Lcp / TH.lcp) * 100, 100) : 0}
        />
      </CardContent>
    </Card>
  );
}

function Vital({
  label,
  value,
  unit,
  threshold,
}: {
  label: string;
  value: number | null;
  unit: string;
  threshold: number;
}) {
  const bad = value !== null && value > threshold;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          bad
            ? 'text-red-500'
            : value === null
              ? 'text-muted-foreground'
              : 'text-green-600'
        }
      >
        {value?.toFixed(label === 'CLS' ? 3 : 0) ?? '-'}
        {unit}
      </span>
    </div>
  );
}
