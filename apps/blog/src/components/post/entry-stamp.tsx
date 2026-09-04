'use client';

import { motion, useScroll, useTransform } from 'motion/react';

type EntryStampProps = {
  label: string;
  children: React.ReactNode;
};

export const EntryStamp = ({ label, children }: EntryStampProps) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0.96, 1], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0.96, 1], [0, 1]);

  return (
    <div className="relative inline-block">
      {children}
      <motion.span
        aria-hidden="true"
        className="bg-accent-ink absolute -bottom-1 left-0 h-0.5 w-full origin-left"
        style={{ scaleX }}
      />
      <motion.span
        className="text-accent-ink absolute top-full left-0 mt-2 text-xs whitespace-nowrap"
        style={{ opacity }}
      >
        {label}
      </motion.span>
    </div>
  );
};
