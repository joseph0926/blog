'use client';

import {
  motion,
  type MotionValue,
  transform,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';
import { SectionHeading } from './section-heading';

type IntroRevealProps = {
  id: string;
  number: string;
  title: string;
  text: string;
};

const restingOpacity = 0.16;

const Word = ({
  word,
  index,
  count,
  progress,
}: {
  word: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) => {
  const start = (index / count) * 0.85;
  const end = start + 0.15;
  const opacity = useTransform(
    progress,
    transform([start, end], [restingOpacity, 1]),
  );

  return <motion.span style={{ opacity }}>{word} </motion.span>;
};

const paragraphClass =
  'text-foreground max-w-[62ch] text-lg leading-8 break-keep sm:text-2xl sm:leading-10';

/** 소개문이 고정 화면 안에서 단어 단위로 잉크가 배듯 드러난다. */
export const IntroReveal = ({ id, number, title, text }: IntroRevealProps) => {
  const ref = useRef<HTMLElement | null>(null);
  const { scrub } = useAboutScroll();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 60%', 'end end'],
  });
  const headingId = `${id}-title`;
  const words = text.split(' ');

  if (!scrub) {
    return (
      <section
        ref={ref}
        id={id}
        aria-labelledby={headingId}
        className="scroll-mt-20 py-12 lg:py-16"
      >
        <SectionHeading id={headingId} number={number} title={title} />
        <p className={`${paragraphClass} mt-8`}>{text}</p>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-14"
      style={{ height: '190svh' }}
    >
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] flex-col justify-center">
        <SectionHeading id={headingId} number={number} title={title} />
        <p className={`${paragraphClass} mt-8`}>
          {words.map((word, index) => (
            <Word
              key={`${index}-${word}`}
              word={word}
              index={index}
              count={words.length}
              progress={scrollYProgress}
            />
          ))}
        </p>
      </div>
    </section>
  );
};
