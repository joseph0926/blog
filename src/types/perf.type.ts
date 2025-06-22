export type PerfSummary = {
  lcpPast: number | null;
  lcpRecent: number | null;
  clsPast: number | null;
  clsRecent: number | null;
  p95Past: number | null;
  p95Recent: number | null;
  bundlePast: number | null;
  bundleRecent: number | null;
};
