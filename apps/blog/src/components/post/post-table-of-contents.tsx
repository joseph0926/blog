'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { useEffect, useState } from 'react';
import type { PostTocItem } from './post-toc';

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
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-112px 0px -62% 0px', threshold: [0, 1] },
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={className} aria-label={label}>
      {showLabel && (
        <p className="text-muted-foreground mb-4 font-mono text-[11px] font-medium tracking-wider uppercase">
          {label}
        </p>
      )}
      <ol
        className={cn('space-y-3 text-sm', variant === 'mobile' && 'space-y-1')}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  'hover:text-foreground focus-visible:ring-ring block rounded-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none',
                  item.depth === 3 && variant === 'rail' && 'pl-4 text-[13px]',
                  item.depth === 3 &&
                    variant === 'mobile' &&
                    'pl-4 text-[13px]',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground',
                  variant === 'mobile' && 'py-1.5',
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
