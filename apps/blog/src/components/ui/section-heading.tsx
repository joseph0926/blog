'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { motion } from 'motion/react';
import { fadeInUp } from '@/lib/motion-variants';

type SectionHeadingProps = {
  title: string;
  description?: string;
  className?: string;
  align?: 'left' | 'center';
};

export const SectionHeading = ({
  title,
  description,
  className,
  align = 'left',
}: SectionHeadingProps) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-100px' }}
      className={cn('mb-8', align === 'center' && 'text-center', className)}
    >
      <h2 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        {title}
      </h2>
      {description && (
        <p className="text-foreground mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {description}
        </p>
      )}
    </motion.div>
  );
};
