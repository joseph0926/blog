'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { motion, useScroll } from 'motion/react';

type ReadingProgressProps = {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export const ReadingProgress = ({
  orientation = 'vertical',
  className,
}: ReadingProgressProps) => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        'bg-accent-ink pointer-events-none',
        orientation === 'vertical'
          ? 'absolute top-0 left-0 h-full w-px origin-top'
          : 'fixed top-0 left-0 z-[60] h-0.5 w-full origin-left',
        className,
      )}
      style={
        orientation === 'vertical'
          ? { scaleY: scrollYProgress }
          : { scaleX: scrollYProgress }
      }
    />
  );
};
