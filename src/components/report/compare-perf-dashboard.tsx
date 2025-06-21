'use client';

import {
  CompareMultiChart,
  RangeKey,
} from '@/components/report/compare-multi-chart';
import { fetchPerf } from '@/lib/server/fetch-perf';

const metricMap = {
  latency: { key: 'p95Req', label: 'p95 Req', unit: 'ms' },
  db: { key: 'p95Db', label: 'p95 DB', unit: 'ms' },
} as const;
type Metric = keyof typeof metricMap;

export default function ComparePerfDashboard(props: {
  initialRoutes: string[];
  initialRange: RangeKey;
  initialMetric: Metric;
  allRoutes: string[];
}) {
  return (
    <CompareMultiChart
      {...props}
      title="API Perf Compare"
      metric={props.initialMetric}
      metricMap={metricMap}
      fetcher={fetchPerf}
      // @ts-expect-error no type
      transform={(row, k) => row[k]}
      queryKeyPrefix="perf"
      urlBase="/report/compare"
    />
  );
}
