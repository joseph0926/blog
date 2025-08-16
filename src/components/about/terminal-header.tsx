'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

export const TerminalHeader = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="border-border bg-card flex items-center justify-between rounded-t-lg border-b px-3 py-2 sm:px-4 sm:py-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-1.5 sm:gap-2">
        {['red', 'yellow', 'green'].map((color, i) => (
          <motion.div
            key={color}
            className={`h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3 ${
              color === 'red'
                ? 'bg-red-500'
                : color === 'yellow'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: i * 0.1 + 0.3,
              type: 'spring',
              stiffness: 500,
            }}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
      <motion.div
        className="text-muted-foreground max-w-[120px] truncate font-mono text-xs sm:max-w-none sm:text-sm"
        animate={{ opacity: isHovered ? 1 : 0.5 }}
      >
        <span className="hidden sm:inline">joseph0926@terminal ~ about</span>
        <span className="sm:hidden">terminal</span>
      </motion.div>
      <div className="w-8 sm:w-14" />
    </motion.div>
  );
};
