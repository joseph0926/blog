'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouteSelect } from '@/hooks/use-route-select';
import { ApiOverviewStat } from '@/lib/server/fetch-api-overview';
import { cn } from '@/lib/utils';

type Props = { stat: ApiOverviewStat };

export function ApiCard({ stat }: Props) {
  const router = useRouter();
  const { selected, toggle } = useRouteSelect();
  const checked = selected.includes(stat.route);

  const navigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/report/route/${encodeURIComponent(stat.route)}`);
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

      <span className="text-sm font-semibold">{stat.route}</span>

      <CardContent className="grid gap-1 p-0 text-sm">
        <Row label="p95 Req" value={stat.p95Req?.toFixed(0)} unit="ms" />
        <Row
          label="Error"
          value={stat.errRate?.toFixed(2)}
          unit="%"
          highlight={stat.errRate !== null && stat.errRate > 1}
        />
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string | undefined;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? 'text-red-500' : ''}>
        {value ?? '-'} {unit}
      </span>
    </div>
  );
}
