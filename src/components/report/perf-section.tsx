import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PerfBarChart, { PerfChartDatum } from './perf-bar-chart';

type Props = {
  data: PerfChartDatum[];
};

export default function PerfSection({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance 스냅샷</CardTitle>
      </CardHeader>
      <CardContent>
        <PerfBarChart data={data} />
      </CardContent>
    </Card>
  );
}
