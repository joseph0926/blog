'use client';

import {
  CompareMultiChart,
  RangeKey,
} from '@/components/report/compare-multi-chart';
import { fetchRumSeries } from '@/lib/server/fetch-rum-series';

const metricMap = {
  lcp: { key: 'p75Lcp', label: 'LCP-p75', unit: 'ms' },
  fcp: { key: 'p75Fcp', label: 'FCP-p75', unit: 'ms' },
  ttfb: { key: 'p75Ttfb', label: 'TTFB-p75', unit: 'ms' },
  inp: { key: 'p75Inp', label: 'INP-p75', unit: 'ms' },
  cls: { key: 'p90Cls', label: 'CLS-p90', unit: '' },
} as const;
type Metric = keyof typeof metricMap;

export default function CompareVitalsDashboard(props: {
  initialRoutes: string[];
  initialRange: RangeKey;
  initialMetric: Metric;
  allRoutes: string[];
}) {
  return (
    <CompareMultiChart
      {...props}
      title="Web Vitals Compare"
      metric={props.initialMetric}
      metricMap={metricMap}
      fetcher={fetchRumSeries}
      // @ts-expect-error no type
      transform={(row, k) => row[k]}
      queryKeyPrefix="vitalSeries"
      urlBase="/report/compare/vitals"
    />
  );
}
