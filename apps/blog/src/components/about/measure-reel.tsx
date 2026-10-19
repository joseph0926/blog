'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { motion } from 'motion/react';
import { usePinnedReel, useReelViewport } from '@/components/dial/use-dial';

export type Measurement = {
  id: string;
  from: string;
  to: string;
  caption: string;
  source: string;
  sourceHref?: string;
};

type MeasureReelProps = {
  id: string;
  title: string;
  items: Measurement[];
};

const REEL = { space: 28, weight: { center: 640, edge: 240 } };

/** about의 작업 기록 릴. 홈 질문 다이얼과 같은 회전 문법으로 측정 한 건씩 가운데에 온다. */
export function MeasureReel({ id, title, items }: MeasureReelProps) {
  const hasRoom = useReelViewport();
  const { mode, trackRef, stageRef, itemRef, centerIndex } =
    usePinnedReel<HTMLParagraphElement>(
      items.length,
      REEL,
      hasRoom && items.length > 0,
    );
  const isReel = mode === 'reel';
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-20 pt-12 sm:pt-28"
    >
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
        className="relative [--reel-height:75svh] sm:[--reel-height:100svh]"
        style={
          isReel
            ? { height: `calc(${(items.length + 1) / 2} * var(--reel-height))` }
            : undefined
        }
      >
        <div
          ref={stageRef}
          className={cn(
            isReel &&
              'sticky top-0 grid h-(--reel-height) grid-rows-[minmax(0,1fr)_auto] overflow-hidden pt-14 pb-8 xl:grid-cols-[minmax(0,1fr)_17rem] xl:grid-rows-1 xl:gap-10 xl:pb-0',
          )}
        >
          <ol
            className={cn(
              isReel ? 'relative min-h-0 overflow-hidden' : 'mt-10 space-y-10',
            )}
          >
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
                    <MeasurementCaption item={item} />
                  </div>
                )}
              </li>
            ))}
          </ol>
          {isReel && (
            <div aria-live="polite" className="grid xl:self-center">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={cn(
                    'col-start-1 row-start-1',
                    index === centerIndex ? 'z-10' : 'pointer-events-none',
                  )}
                  aria-hidden={index !== centerIndex}
                  inert={index !== centerIndex}
                  initial={false}
                  animate={{
                    opacity: index === centerIndex ? 1 : 0,
                    y: index === centerIndex ? 0 : 4,
                  }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <MeasurementCaption item={item} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MeasurementCaption({ item }: { item: Measurement }) {
  return (
    <>
      <p className="text-foreground/85 text-[15px] leading-[1.7]">
        {item.caption}
      </p>
      <p className="text-muted-foreground mt-2 text-sm">
        {item.sourceHref ? (
          <a
            href={item.sourceHref}
            className="hover:text-accent-ink focus-visible:outline-ring rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {item.source}
          </a>
        ) : (
          item.source
        )}
      </p>
    </>
  );
}
