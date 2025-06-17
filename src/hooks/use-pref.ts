'use client';

import { useQuery } from '@tanstack/react-query';

export const useLatency = (route: string) =>
  useQuery({
    queryKey: ['latency', route],
    queryFn: () => fetch(`/api/perf?route=${route}`).then((r) => r.json()),
  });
export const useVitals = (route: string) =>
  useQuery({
    queryKey: ['vitals', route],
    queryFn: () => fetch(`/api/vitals?route=${route}`).then((r) => r.json()),
    staleTime: 10 * 60_000,
  });
export const useHits = (route: string) =>
  useQuery({
    queryKey: ['hits', route],
    queryFn: () => fetch(`/api/hits?route=${route}`).then((r) => r.json()),
  });
