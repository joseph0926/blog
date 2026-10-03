'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { usePinnedReel } from '@/components/dial/use-dial';

export type Measurement = {
  id: string;
  from: string;
  to: string;
  caption: string;
  source: string;
};

type MeasureReelProps = {
  id: string;
  title: string;
  items: Measurement[];
};

const REEL = { space: 28, weight: { center: 640, edge: 240 } };

/** about의 작업 기록 릴. 홈 질문 다이얼과 같은 회전 문법으로 측정 한 건씩 가운데에 온다. */
export function MeasureReel({ id, title, items }: MeasureReelProps) {
  const { mode, trackRef, stageRef, itemRef, centerIndex } =
    usePinnedReel<HTMLParagraphElement>(items.length, REEL);
  const isReel = mode === 'reel';
  const current = items[centerIndex] ?? items[0];
  const headingId = `${id}-heading`;

  return (
    <section id={id} aria-labelledby={headingId} className="pt-28">
      <h2
        id={headingId}
        className="text-foreground font-serif text-[2rem] leading-[1.25] font-semibold tracking-[-0.025em]"
      >
        {title}
      </h2>
      <div
        ref={trackRef}
        role="region"
        aria-label={title}
        className="relative"
        style={
          isReel
            ? { height: `calc(${items.length - 1} * 50svh + 100svh)` }
            : undefined
        }
      >
        {isReel &&
          items.map((item, index) => (
            <div
              key={item.id}
              aria-hidden="true"
              className="absolute left-0 h-px w-px snap-start"
              style={{ top: `calc(${index} * 50svh)` }}
            />
          ))}
        <div
          ref={stageRef}
          className={cn(
            isReel &&
              'sticky top-0 grid h-svh grid-rows-[minmax(0,1fr)_auto] overflow-hidden pt-14 pb-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:grid-rows-1 xl:gap-10 xl:pb-0',
          )}
        >
          <ol className={cn(isReel ? 'relative' : 'mt-10 space-y-10')}>
            {items.map((item, index) => (
              <li key={item.id}>
                <p
                  ref={itemRef(index)}
                  className={cn(
                    'text-foreground font-serif tracking-[-0.03em] break-keep',
                    isReel
                      ? 'absolute top-1/2 left-0 origin-top-left text-[clamp(2.25rem,5vw,4rem)]/[1.15] will-change-transform'
                      : 'text-3xl/[1.2] font-medium',
                  )}
                >
                  <span className="text-muted-foreground">{item.from}</span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    {' → '}
                  </span>
                  <span>{item.to}</span>
                </p>
                {!isReel && (
                  <div className="mt-3 max-w-[38em]">
                    <p className="text-foreground/85 text-[15px] leading-[1.7]">
                      {item.caption}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                      {item.source}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {isReel && (
            <div aria-live="polite" className="xl:self-center">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4, transition: { duration: 0.08 } }}
                  transition={{ duration: 0.14, ease: 'easeOut' }}
                >
                  <p className="text-foreground/85 text-[15px] leading-[1.7]">
                    {current.caption}
                  </p>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {current.source}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
