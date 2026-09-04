'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { useActiveSection } from '@/hooks/use-active-section';
import type { PostTocItem } from './post-toc';
import { ReadingProgress } from './reading-progress';

type PostTableOfContentsProps = {
  items: PostTocItem[];
  label: string;
  className?: string;
  variant?: 'rail' | 'mobile';
  showLabel?: boolean;
};

export function PostTableOfContents({
  items,
  label,
  className,
  variant = 'rail',
  showLabel = true,
}: PostTableOfContentsProps) {
  const activeId = useActiveSection(items.map((item) => item.id));

  if (items.length === 0) return null;

  return (
    <nav className={className} aria-label={label}>
      {showLabel && (
        <p className="text-muted-foreground mb-3 text-xs">{label}</p>
      )}
      <div className="relative">
        {variant === 'rail' && <ReadingProgress />}
        <ol
          className={cn(
            'border-rule border-l text-sm',
            variant === 'mobile' ? 'space-y-0.5' : 'space-y-1',
          )}
        >
          {items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={cn(
                    'focus-visible:ring-ring relative block rounded-sm py-1 pl-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                    item.depth === 3 && 'pl-7 text-[13px]',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                    variant === 'mobile' && 'py-1.5',
                  )}
                  aria-current={isActive ? 'location' : undefined}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'bg-accent-ink ease-ink absolute top-1/2 -left-px h-4 w-0.5 -translate-y-1/2 transition-opacity duration-150 motion-reduce:transition-none',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {item.text}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
