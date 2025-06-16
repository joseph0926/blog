import { ArrowUpRight } from 'lucide-react';
import { getTopSlowRoutes } from '@/actions/report.action';
import { SlowRouteList } from './slow-route-list';

type Props = { range: string; version: string };

export async function SlowRouteSection({ range, version }: Props) {
  const { data } = await getTopSlowRoutes({ range, version }, 5);
  const routes = data?.routes ?? [];

  return (
    <section className="bg-card rounded-xl border p-4 shadow-sm">
      <h2 className="mb-2 font-medium">Top 5 Slow Routes</h2>
      <SlowRouteList routes={routes} />
      <a
        href="/report/routes"
        className="text-primary mt-2 inline-flex items-center text-xs hover:underline"
      >
        전체 보기 <ArrowUpRight className="ml-1 h-3 w-3" />
      </a>
    </section>
  );
}
