'use client';

import { cn } from '@joseph0926/ui/lib/utils';
import { motion, useScroll } from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';
import { SectionHeading } from './section-heading';

type ScrubSectionProps = {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

/** 위쪽 괘선이 스크롤 진행값만큼 그려지는 장. 본문은 움직이지 않는다. */
export const ScrubSection = ({
  id,
  number,
  title,
  children,
  className,
}: ScrubSectionProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const { scrub } = useAboutScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 92%', 'start 55%'],
  });
  const headingId = `${id}-title`;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn('relative scroll-mt-20 py-12 lg:py-16', className)}
    >
      <motion.span
        aria-hidden="true"
        className="bg-rule absolute inset-x-0 top-0 h-px origin-left"
        style={{ scaleX: scrub ? scrollYProgress : 1 }}
      />
      <SectionHeading id={headingId} number={number} title={title} />
      {children}
    </section>
  );
};
