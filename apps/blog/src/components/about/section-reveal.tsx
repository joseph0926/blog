'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { motion, useReducedMotion } from 'motion/react';

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'li';
  id?: string;
  'aria-labelledby'?: string;
};

const ease = [0.23, 1, 0.32, 1] as const;

export const SectionReveal = ({
  children,
  className,
  as = 'section',
  ...rest
}: SectionRevealProps) => {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      {...rest}
      className={cn('relative', className)}
      initial={reduceMotion ? false : { opacity: 0.35, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.55, ease }}
    >
      <motion.span
        aria-hidden="true"
        className="bg-rule absolute inset-x-0 top-0 h-px origin-left"
        initial={reduceMotion ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-12% 0px' }}
        transition={{ duration: 0.7, ease }}
      />
      {children}
    </Component>
  );
};
