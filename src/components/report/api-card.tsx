'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ApiOverviewStat } from '@/lib/server/fetch-api-overview';
import { cn } from '@/lib/utils';

type Props = { stat: ApiOverviewStat };

export function ApiCard({ stat }: Props) {
  const router = useRouter();

  const navigate = () => {
    router.push(`/report/route/${encodeURIComponent(stat.route)}`);
  };

  return (
    <Card
      role="button"
      onClick={navigate}
      className={cn(
        'hover:ring-primary/50 relative flex flex-col gap-2 p-4 transition hover:ring-1',
      )}
    >
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
