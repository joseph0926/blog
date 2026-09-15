'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { motion, transform, useTransform } from 'motion/react';
import { ReadingProgress } from '@/components/post/reading-progress';
import { useActiveSection } from '@/hooks/use-active-section';
import { useAboutScroll } from './about-scroll';

export type Chapter = {
  id: string;
  number: string;
  label: string;
};

type ChapterIndexProps = {
  label: string;
  name: string;
  chapters: Chapter[];
};

export const ChapterIndex = ({ label, name, chapters }: ChapterIndexProps) => {
  const { coverProgress, reduceMotion } = useAboutScroll();
  const activeId = useActiveSection(chapters.map((chapter) => chapter.id));
  const nameOpacity = useTransform(coverProgress, transform([0.75, 1], [0, 1]));
  const nameY = useTransform(
    coverProgress,
    transform([0.75, 1], [reduceMotion ? 0 : 8, 0]),
  );

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20">
        <motion.p
          aria-hidden="true"
          style={{ opacity: nameOpacity, y: nameY }}
          className="text-foreground mb-6 text-lg font-semibold tracking-tight"
        >
          {name}
        </motion.p>
        <nav aria-label={label}>
          <p className="text-muted-foreground mb-3 text-xs">{label}</p>
          <div className="relative">
            <ReadingProgress />
            <ol className="border-rule space-y-1 border-l text-sm">
              {chapters.map((chapter) => {
                const isActive = chapter.id === activeId;

                return (
                  <li key={chapter.id}>
                    <a
                      href={`#${chapter.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      className={cn(
                        'focus-visible:ring-ring relative flex items-baseline gap-3 rounded-sm py-1 pl-4 transition-colors duration-150 focus-visible:ring-2 focus-visible:outline-none',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'bg-accent-ink ease-ink absolute top-1/2 -left-px h-4 w-0.5 -translate-y-1/2 transition-opacity duration-150 motion-reduce:transition-none',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="font-mono text-xs tabular-nums">
                        {chapter.number}
                      </span>
                      {chapter.label}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      </div>
    </aside>
  );
};
