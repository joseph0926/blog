'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { AlertCircle, CheckCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

interface InteractiveDemoProps {
  children: React.ReactNode;
  className?: string;
}

export function CacheDescription({
  children,
  className,
}: InteractiveDemoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'border-border/50 from-background to-muted/20 my-8 overflow-hidden rounded-xl border bg-gradient-to-b shadow-lg transition-all',
        'dark:from-background dark:to-muted/10',
        className,
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-muted/30 hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left transition-colors sm:px-6 sm:py-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10">
            <RefreshCw className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span className="text-sm font-semibold sm:text-base">
            직접 실험해보기
          </span>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2"
            >
              <CheckCircle className="h-4 w-4 text-green-500 sm:h-5 sm:w-5" />
            </motion.div>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-border/30 border-t">
              <div className="border-border/30 flex items-start gap-2 border-b bg-blue-500/5 px-4 py-3 sm:gap-3 sm:px-6 sm:py-4">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 sm:h-5 sm:w-5" />
                <p className="text-muted-foreground text-xs sm:text-sm">
                  아래 단계를 따라하면서 캐싱이 어떻게 동작하는지 직접
                  확인해보세요.
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {children}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCompleted(!isCompleted)}
                  className={cn(
                    'mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-all sm:mt-6 sm:px-6 sm:py-3 sm:text-base',
                    isCompleted
                      ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400'
                      : 'bg-primary/10 text-primary hover:bg-primary/20',
                  )}
                >
                  {isCompleted ? '실험 완료!' : '실험을 완료했어요'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
