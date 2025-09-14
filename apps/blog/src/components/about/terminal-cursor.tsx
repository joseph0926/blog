'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface TerminalCursorProps {
  show?: boolean;
}

export const TerminalCursor = ({ show = true }: TerminalCursorProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <motion.span
      className="bg-foreground ml-0.5 inline-block h-3 w-1 sm:ml-1 sm:h-5 sm:w-2"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0 }}
    />
  );
};
