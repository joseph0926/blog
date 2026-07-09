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
        className={cn(
          'text-sm',
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
                    ? 'font-medium text-[#5e6ad2]'
                    : 'text-muted-foreground hover:text-foreground',
                  variant === 'mobile' && 'py-1.5',
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#5e6ad2] transition-opacity duration-150',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {item.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
