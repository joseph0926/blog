'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { useActiveSection } from '@/hooks/use-active-section';

type YearIndexProps = {
  label: string;
  years: { year: string; id: string; count: number }[];
};

const ROW_HEIGHT_REM = 1.75;

export const YearIndex = ({ label, years }: YearIndexProps) => {
  const activeId = useActiveSection(
    years.map((item) => item.id),
    { rootMargin: '-96px 0px -70% 0px' },
  );
  const activeIndex = Math.max(
    0,
    years.findIndex((item) => item.id === activeId),
  );

  return (
    <nav aria-label={label} className="text-sm">
      <p className="text-muted-foreground mb-3 text-xs">{label}</p>
      <div className="relative">
        <span
          aria-hidden="true"
          className="bg-accent-ink motion-safe:ease-ink absolute top-0 left-0 h-7 w-0.5 motion-safe:transition-transform motion-safe:duration-200"
          style={{
            transform: `translateY(${activeIndex * ROW_HEIGHT_REM}rem)`,
          }}
        />
        <ol className="border-rule border-l">
          {years.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id} className="h-7">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'focus-visible:ring-ring flex h-7 items-center justify-between gap-3 pr-2 pl-4 font-mono text-[13px] tabular-nums transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span>{item.year}</span>
                  <span className="text-muted-foreground text-[11px]">
                    {item.count}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
