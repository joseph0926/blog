'use client';

import { ArrowRight } from 'lucide-react';
import {
  animate,
  motion,
  type MotionValue,
  transform,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';
import { type Measurement, parseMeasure } from './measure';

type PinnedReelProps = {
  label: string;
  items: Measurement[];
};

const formatNumber = (value: number, decimals: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const CountingValue = ({
  progress,
  from,
  to,
  activeFrom,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  from: string;
  to: string;
  activeFrom: number;
  reduceMotion: boolean;
}) => {
  const parsedFrom = parseMeasure(from);
  const parsedTo = parseMeasure(to);
  const canCount =
    parsedFrom && parsedTo && parsedFrom.suffix === parsedTo.suffix;
  const decimals = Math.max(parsedFrom?.decimals ?? 0, parsedTo?.decimals ?? 0);
  const value = useMotionValue(parsedTo?.value ?? 0);
  const played = useRef(false);

  useMotionValueEvent(progress, 'change', (p) => {
    if (!canCount || !parsedFrom || !parsedTo || reduceMotion) return;
    if (played.current || p < activeFrom) return;
    played.current = true;
    value.set(parsedFrom.value);
    animate(value, parsedTo.value, { duration: 0.9, ease: [0.23, 1, 0.32, 1] });
  });

  const text = useTransform(value, (current) =>
    canCount && parsedTo
      ? `${parsedTo.prefix}${formatNumber(current, decimals)}${parsedTo.suffix}`
      : to,
  );

  return <motion.span>{text}</motion.span>;
};

const ReelItem = ({
  item,
  index,
  count,
  label,
}: {
  item: Measurement;
  index: number;
  count: number;
  label: string;
}) => {
  const { reelProgress, reduceMotion } = useAboutScroll();
  const segment = 1 / count;
  const start = index * segment;
  const end = start + segment;
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const fadeIn = start + segment * 0.12;
  const fadeOut = end - segment * 0.12;
  const inputs = [
    ...(isFirst ? [] : [start, fadeIn]),
    ...(isLast ? [] : [fadeOut, end]),
  ];
  const opacity = useTransform(
    reelProgress,
    transform(inputs, [...(isFirst ? [] : [0, 1]), ...(isLast ? [] : [1, 0])]),
  );
  const y = useTransform(
    reelProgress,
    transform(inputs, [
      ...(isFirst ? [] : [32, 0]),
      ...(isLast ? [] : [0, -24]),
    ]),
  );

  return (
    <motion.li
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center"
      aria-hidden={isFirst ? undefined : true}
    >
      <div className="grid w-full gap-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {label} {String(index + 1).padStart(2, '0')}
        </p>
        <div>
          <p className="text-foreground flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono text-[2.25rem] leading-none tracking-tight tabular-nums sm:text-6xl lg:text-7xl">
            <span className="text-muted-foreground line-through decoration-1">
              {item.from}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="text-accent-ink h-6 w-6 self-center sm:h-8 sm:w-8"
            />
            <CountingValue
              progress={reelProgress}
              from={item.from}
              to={item.to}
              activeFrom={isFirst ? 0.001 : start + segment * 0.04}
              reduceMotion={reduceMotion}
            />
          </p>
          <p className="text-foreground mt-8 max-w-[48ch] text-lg leading-8 break-keep sm:text-xl sm:leading-9">
            {item.caption}
          </p>
          <p className="text-muted-foreground mt-4 font-mono text-xs">
            {item.source}
          </p>
        </div>
      </div>
    </motion.li>
  );
};

const StaticReel = ({ label, items }: PinnedReelProps) => (
  <ol>
    {items.map((item, index) => (
      <li key={item.id} className="flex min-h-[70svh] items-center py-16">
        <div className="grid w-full gap-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
          <p className="text-muted-foreground font-mono text-xs tabular-nums">
            {label} {String(index + 1).padStart(2, '0')}
          </p>
          <div>
            <p className="text-foreground flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono text-[2.25rem] leading-none tracking-tight tabular-nums sm:text-6xl lg:text-7xl">
              <span className="text-muted-foreground line-through decoration-1">
                {item.from}
              </span>
              <ArrowRight
                aria-hidden="true"
                className="text-accent-ink h-6 w-6 self-center sm:h-8 sm:w-8"
              />
              <span>{item.to}</span>
            </p>
            <p className="text-foreground mt-8 max-w-[48ch] text-lg leading-8 break-keep sm:text-xl sm:leading-9">
              {item.caption}
            </p>
            <p className="text-muted-foreground mt-4 font-mono text-xs">
              {item.source}
            </p>
          </div>
        </div>
      </li>
    ))}
  </ol>
);

export const PinnedReel = ({ label, items }: PinnedReelProps) => {
  const { reelRef, reduceMotion, mounted } = useAboutScroll();

  return (
    <section
      id="measurements"
      aria-label={label}
      className="mx-auto max-w-[1260px] scroll-mt-14 px-4"
    >
      <div ref={reelRef}>
        {!mounted || reduceMotion ? (
          <StaticReel label={label} items={items} />
        ) : (
          <div style={{ height: `${items.length * 100}svh` }}>
            <ol className="sticky top-14 h-[calc(100svh-3.5rem)]">
              {items.map((item, index) => (
                <ReelItem
                  key={item.id}
                  item={item}
                  index={index}
                  count={items.length}
                  label={label}
                />
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
};
