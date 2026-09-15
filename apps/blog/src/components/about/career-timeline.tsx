'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';

export type CareerEntry = {
  id: string;
  period: string;
  company: string;
  role: string;
  highlight: string;
  details: string[];
};

type CareerTimelineProps = {
  entries: CareerEntry[];
  chapterLabel: string;
};

/** 각 장의 상세는 스크롤 진행값만큼 아래에서 열린다. */
const CareerItem = ({
  entry,
  chapterNumber,
  chapterLabel,
}: {
  entry: CareerEntry;
  chapterNumber: number;
  chapterLabel: string;
}) => {
  const ref = useRef<HTMLLIElement | null>(null);
  const { scrub } = useAboutScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'start 45%'],
  });
  const clipPath = useTransform(
    scrollYProgress,
    (progress) => `inset(0 0 ${(1 - progress) * 100}% 0)`,
  );

  return (
    <li
      ref={ref}
      className="border-rule grid gap-4 border-t py-8 lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-10"
    >
      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="text-muted-foreground font-mono text-xs tabular-nums">
          {chapterLabel} {chapterNumber}
        </p>
        <p className="text-foreground mt-1 font-mono text-sm tabular-nums">
          {entry.period}
        </p>
      </div>
      <div className="max-w-[68ch]">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">
          {entry.company}
          <span className="text-muted-foreground ml-3 text-base font-normal">
            {entry.role}
          </span>
        </h3>
        <p className="text-foreground mt-4 text-base leading-7 break-keep">
          {entry.highlight}
        </p>
        <motion.ul
          style={scrub ? { clipPath } : undefined}
          className="text-muted-foreground mt-4 space-y-2 text-sm leading-6"
        >
          {entry.details.map((detail) => (
            <li key={detail} className="border-rule border-l-2 pl-4">
              {detail}
            </li>
          ))}
        </motion.ul>
      </div>
    </li>
  );
};

export const CareerTimeline = ({
  entries,
  chapterLabel,
}: CareerTimelineProps) => {
  const ref = useRef<HTMLOListElement | null>(null);
  const { scrub } = useAboutScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 60%', 'end 60%'],
  });
  const markerTop = useTransform(scrollYProgress, (p) => `${p * 100}%`);

  return (
    <div className="relative mt-8 pl-6 sm:pl-8">
      <div
        aria-hidden="true"
        className="bg-rule absolute top-0 bottom-0 left-0 w-px"
      >
        <motion.span
          className="bg-accent-ink absolute inset-x-0 top-0 origin-top"
          style={{ height: '100%', scaleY: scrub ? scrollYProgress : 1 }}
        />
        <motion.span
          className="bg-accent-ink absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ top: scrub ? markerTop : '100%' }}
        />
      </div>
      <ol ref={ref}>
        {entries.map((entry, index) => (
          <CareerItem
            key={entry.id}
            entry={entry}
            chapterNumber={entries.length - index}
            chapterLabel={chapterLabel}
          />
        ))}
      </ol>
    </div>
  );
};
