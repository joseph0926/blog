'use client';

import { CalendarRange, Tag } from 'lucide-react';
import { AnimatePresence,motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useLayoutEffect, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSelectProps {
  value: string;
  placeholder: string;
  ariaLabel: string;
  items: { label: string; value: string }[];
  icon?: React.ReactNode;
  onChange: (val: string) => void;
  widthClass?: string;
}

function FilterSelect({
  value,
  placeholder,
  ariaLabel,
  items,
  icon,
  onChange,
  widthClass = 'w-[96px]',
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} aria-label={ariaLabel}>
      <SelectTrigger
        className={`border-border bg-background h-8 ${widthClass} flex items-center gap-1 truncate`}
      >
        {icon}
        <SelectValue
          placeholder={placeholder}
          className="truncate capitalize"
        />
      </SelectTrigger>
      <SelectContent className="max-h-64 overflow-y-auto">
        <motion.div {...pop}>
          {items.map((i) => (
            <SelectItem key={i.value} value={i.value} className="capitalize">
              {i.label}
            </SelectItem>
          ))}
        </motion.div>
      </SelectContent>
    </Select>
  );
}

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

export function HeaderFiltersClient({
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
  }, []);

  const currentRange = params.get('range') ?? initRange;
  const currentVersion = params.get('version') ?? initVersion;

  const versionItems = [
    { label: 'Latest', value: 'latest' },
    ...versions.map((v) => ({ label: v, value: v })),
  ];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key="filters" {...pop} className="flex items-center gap-2">
        <FilterSelect
          value={currentRange}
          placeholder="range"
          ariaLabel="기간 선택"
          items={ranges}
          icon={<CalendarRange className="text-muted-foreground h-3.5 w-3.5" />}
          onChange={(val) =>
            startTransition(() => router.push(buildHref('range', val)))
          }
        />

        <FilterSelect
          value={currentVersion}
          placeholder="version"
          ariaLabel="버전 선택"
          items={versionItems}
          widthClass="w-[150px]"
          icon={<Tag className="text-muted-foreground h-3.5 w-3.5" />}
          onChange={(val) =>
            startTransition(() => router.push(buildHref('version', val)))
          }
        />
      </motion.div>
    </AnimatePresence>
  );
}
