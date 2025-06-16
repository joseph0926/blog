'use client';

import { useCallback, useLayoutEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const pop = {
  initial: { opacity: 0, scale: 0.95, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, scale: 0.95, y: 4, transition: { duration: 0.1 } },
} as const;

type HeaderFiltersClientProps = {
  pathname: string;
  initRange: string;
  initVersion: string;
  ranges: { label: string; value: string }[];
  versions: string[];
};

export default function HeaderFiltersClient({
  pathname,
  initRange,
  initVersion,
  ranges,
  versions,
}: HeaderFiltersClientProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const buildHref = useCallback(
    (key: 'range' | 'version', value: string) => {
      const sp = new URLSearchParams(params.toString());
      sp.set(key, value);
      return pathname + '?' + sp.toString();
    },
    [params, pathname],
  );

  useLayoutEffect(() => {
    const range = params.get('range');
    const version = params.get('version');
    if (range && version) return;

    const sp = new URLSearchParams(params.toString());
    if (!range) sp.set('range', initRange);
    if (!version) sp.set('version', initVersion);
    router.replace(pathname + '?' + sp.toString());
  }, [params, router, pathname, initRange, initVersion]);

  const currentRange = params.get('range') ?? initRange;
  const currentVersion = params.get('version') ?? initVersion;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key="filters" {...pop} className="flex items-center gap-2">
        <Select
          value={currentRange}
          onValueChange={(val) =>
            startTransition(() => router.push(buildHref('range', val)))
          }
        >
          <SelectTrigger className="border-border bg-background h-8 w-[84px] capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <motion.div {...pop}>
              {ranges.map((r) => (
                <SelectItem
                  key={r.value}
                  value={r.value}
                  className="capitalize"
                >
                  {r.label}
                </SelectItem>
              ))}
            </motion.div>
          </SelectContent>
        </Select>
        <Select
          value={currentVersion}
          onValueChange={(val) =>
            startTransition(() => router.push(buildHref('version', val)))
          }
        >
          <SelectTrigger className="border-border bg-background h-8 w-[140px] truncate">
            <SelectValue placeholder="latest" className="truncate capitalize" />
          </SelectTrigger>
          <SelectContent className="max-h-64 overflow-y-auto">
            <motion.div {...pop}>
              <SelectItem value="latest">Latest</SelectItem>
              {versions.map((v) => (
                <SelectItem key={v} value={v} className="truncate">
                  {v}
                </SelectItem>
              ))}
            </motion.div>
          </SelectContent>
        </Select>
      </motion.div>
    </AnimatePresence>
  );
}
