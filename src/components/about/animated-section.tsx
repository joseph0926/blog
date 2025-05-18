'use client';

import { motion } from 'motion/react';
import { PropsWithChildren } from 'react';

export default function AnimatedSection({ children }: PropsWithChildren) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.section>
  );
}
