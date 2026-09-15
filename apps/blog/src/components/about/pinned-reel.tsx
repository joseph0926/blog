'use client';

import { ArrowRight } from 'lucide-react';
import {
  motion,
  type MotionValue,
  transform,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';
import { type Measurement, parseMeasure } from './measure';
import { SectionHeading } from './section-heading';

type PinnedReelProps = {
  id: string;
  number: string;
  label: string;
  items: Measurement[];
};

type Segment = {
  start: number;
  end: number;
};

const formatNumber = (value: number, decimals: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const valueClass =
  'text-foreground flex flex-wrap items-baseline gap-x-4 gap-y-2 font-mono text-[2.25rem] leading-none tracking-tight tabular-nums sm:text-6xl lg:text-7xl';

const ReelBody = ({
  item,
  index,
  label,
  from,
  to,
}: {
  item: Measurement;
  index: number;
  label: string;
  from: React.ReactNode;
  to: React.ReactNode;
}) => (
  <div className="w-full">
    <p className="text-muted-foreground font-mono text-xs tabular-nums">
      {label} {String(index + 1).padStart(2, '0')}
    </p>
    <p className={`${valueClass} mt-6`}>
      {from}
      <ArrowRight
        aria-hidden="true"
        className="text-accent-ink h-6 w-6 self-center sm:h-8 sm:w-8"
      />
      {to}
    </p>
    <p className="text-foreground mt-8 max-w-[48ch] text-lg leading-8 break-keep sm:text-xl sm:leading-9">
      {item.caption}
    </p>
    <p className="text-muted-foreground mt-4 font-mono text-xs">
      {item.source}
    </p>
  </div>
);

const fromClass = 'text-muted-foreground line-through decoration-1';

/** 숫자는 스크롤 진행값만큼 from에서 to로 세어진다. */
const CountingValue = ({
  progress,
  segment,
  from,
  to,
}: {
  progress: MotionValue<number>;
  segment: Segment;
  from: string;
  to: string;
}) => {
  const parsedFrom = parseMeasure(from);
  const parsedTo = parseMeasure(to);
  const canCount =
    parsedFrom && parsedTo && parsedFrom.suffix === parsedTo.suffix;
  const decimals = Math.max(parsedFrom?.decimals ?? 0, parsedTo?.decimals ?? 0);
  const length = segment.end - segment.start;
  const value = useTransform(
    progress,
    transform(
      [segment.start + length * 0.08, segment.start + length * 0.5],
      [parsedFrom?.value ?? 0, parsedTo?.value ?? 0],
    ),
  );
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
  progress,
}: {
  item: Measurement;
  index: number;
  count: number;
  label: string;
  progress: MotionValue<number>;
}) => {
  const length = 1 / count;
  const segment = { start: index * length, end: (index + 1) * length };
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const fadeIn = segment.start + length * 0.12;
  const fadeOut = segment.end - length * 0.12;
  const inputs = [
    ...(isFirst ? [] : [segment.start, fadeIn]),
    ...(isLast ? [] : [fadeOut, segment.end]),
  ];
  const opacity = useTransform(
    progress,
    transform(inputs, [...(isFirst ? [] : [0, 1]), ...(isLast ? [] : [1, 0])]),
  );
  const y = useTransform(
    progress,
    transform(inputs, [
      ...(isFirst ? [] : [32, 0]),
      ...(isLast ? [] : [0, -24]),
    ]),
  );
  const fromY = useTransform(
    progress,
    transform(
      [segment.start, segment.end],
      [isFirst ? 0 : 10, isLast ? 0 : -10],
    ),
  );
  const toY = useTransform(
    progress,
    transform(
      [segment.start, segment.end],
      [isFirst ? 0 : 28, isLast ? 0 : -28],
    ),
  );

  return (
    <motion.li
      style={{ opacity, y }}
      className="absolute inset-0 flex items-center"
      aria-hidden={isFirst ? undefined : true}
    >
      <ReelBody
        item={item}
        index={index}
        label={label}
        from={
          <motion.span style={{ y: fromY }} className={fromClass}>
            {item.from}
          </motion.span>
        }
        to={
          <motion.span style={{ y: toY }}>
            <CountingValue
              progress={progress}
              segment={segment}
              from={item.from}
              to={item.to}
            />
          </motion.span>
        }
      />
    </motion.li>
  );
};

export const PinnedReel = ({ id, number, label, items }: PinnedReelProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrub } = useAboutScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const headingId = `${id}-title`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-14 pt-12 lg:pt-16"
    >
      <SectionHeading id={headingId} number={number} title={label} />
      <div ref={ref}>
        {scrub ? (
          <div style={{ height: `${items.length * 100}svh` }}>
            <ol className="sticky top-14 h-[calc(100svh-3.5rem)]">
              {items.map((item, index) => (
                <ReelItem
                  key={item.id}
                  item={item}
                  index={index}
                  count={items.length}
                  label={label}
                  progress={scrollYProgress}
                />
              ))}
            </ol>
          </div>
        ) : (
          <ol>
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex min-h-[70svh] items-center py-16"
              >
                <ReelBody
                  item={item}
                  index={index}
                  label={label}
                  from={<span className={fromClass}>{item.from}</span>}
                  to={<span>{item.to}</span>}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};
