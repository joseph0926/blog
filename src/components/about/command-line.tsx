'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { TerminalCursor } from './terminal-cursor';

interface CommandLineProps {
  command: string;
  onComplete?: () => void;
  delay?: number;
}

export const CommandLine = ({
  command,
  onComplete,
  delay = 0,
}: CommandLineProps) => {
  const [displayedCommand, setDisplayedCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsTyping(true);
      let index = 0;

      const typeTimer = setInterval(() => {
        if (index <= command.length) {
          setDisplayedCommand(command.slice(0, index));
          index++;
        } else {
          clearInterval(typeTimer);
          setIsTyping(false);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
        }
      }, 50);

      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [command, delay, onComplete]);

  return (
    <motion.div
      className="text-foreground flex items-center font-mono text-sm break-all sm:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay / 1000 }}
    >
      <span className="text-chart-1 dark:text-chart-1 mr-1 flex-shrink-0 sm:mr-2">
        $
      </span>
      <span className="min-w-0">{displayedCommand}</span>
      <TerminalCursor show={isTyping} />
    </motion.div>
  );
};
