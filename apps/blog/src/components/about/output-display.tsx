'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface OutputDisplayProps {
  children: ReactNode;
  delay?: number;
}

export const OutputDisplay = ({ children, delay = 0 }: OutputDisplayProps) => {
  return (
    <motion.div
      className="text-foreground mt-2 pl-2 font-mono text-sm sm:pl-4 sm:text-base"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: delay / 1000,
        duration: 0.3,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
};
