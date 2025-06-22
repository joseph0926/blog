import HistoryChart from '@/components/report/history-chart';
import { getPerfHistory } from '@/lib/server/fetch-perf-history';

export const revalidate = 3600;

export default async function HistoryPage() {
  const history = await getPerfHistory(30);

  return (
    <main className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Performance History (30 일)</h1>
      <HistoryChart raw={history} />
    </main>
  );
}
