'use client';

import { ArrowDown } from 'lucide-react';
import { motion, transform, useTransform } from 'motion/react';
import { useAboutScroll } from './about-scroll';

type AboutCoverProps = {
  hint: string;
  name: string;
  role: string;
  scrollHint: string;
  intro: string;
};

export const AboutCover = ({
  hint,
  name,
  role,
  scrollHint,
  intro,
}: AboutCoverProps) => {
  const { coverRef, coverProgress, reduceMotion } = useAboutScroll();
  const nameX = useTransform(
    coverProgress,
    transform([0, 1], [0, reduceMotion ? 0 : -48]),
  );
  const roleX = useTransform(
    coverProgress,
    transform([0, 1], [0, reduceMotion ? 0 : 48]),
  );
  const lineScale = useTransform(coverProgress, transform([0, 1], [1, 1.12]));
  const fade = useTransform(
    coverProgress,
    transform([0, 0.7, 1], [1, 1, 0.15]),
  );

  return (
    <motion.section
      ref={coverRef}
      aria-labelledby="about-cover-title"
      style={{ opacity: fade }}
      className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[1260px] flex-col justify-between px-4 pt-10 pb-8 sm:pt-14"
    >
      <p className="text-muted-foreground font-mono text-xs">{hint}</p>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
        <motion.h1
          id="about-cover-title"
          style={{ x: nameX }}
          className="text-foreground text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] font-semibold tracking-[-0.03em]"
        >
          {name}
        </motion.h1>
        <motion.span
          aria-hidden="true"
          style={{ scaleX: lineScale }}
          className="border-rule mb-[0.35em] hidden flex-1 origin-center border-t sm:block"
        />
        <motion.p
          style={{ x: roleX }}
          className="text-muted-foreground mb-[0.25em] text-lg sm:text-right sm:text-2xl"
        >
          {role}
        </motion.p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
        <a
          href="#measurements"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-2 self-start rounded-sm text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:outline-none"
        >
          {scrollHint}
          <ArrowDown className="h-4 w-4" />
        </a>
        <p className="text-foreground max-w-[62ch] text-base leading-7 break-keep sm:text-lg sm:leading-8">
          {intro}
        </p>
      </div>
    </motion.section>
  );
};
