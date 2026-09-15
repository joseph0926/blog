'use client';

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react';
import { useRef } from 'react';
import { useAboutScroll } from './about-scroll';

type VelocityMarqueeProps = {
  items: string[];
};

const copies = 4;
const basePercentPerSecond = 3;

/** 도구 이름이 흐르는 장식 띠. 스크롤 속도에 따라 가속하고 방향이 바뀐다. */
export const VelocityMarquee = ({ items }: VelocityMarqueeProps) => {
  const { scrub } = useAboutScroll();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });
  const direction = useRef(1);
  const x = useTransform(baseX, (value) => `${wrap(-100 / copies, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (!scrub) return;
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    const seconds = delta / 1000;
    const move =
      direction.current *
      basePercentPerSecond *
      seconds *
      (1 + Math.abs(factor));
    baseX.set(baseX.get() + move);
  });

  if (!scrub) return null;

  const line = items.join('  /  ');

  return (
    <div
      aria-hidden="true"
      className="border-rule -mx-4 overflow-hidden border-y py-3 sm:mx-0"
    >
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {Array.from({ length: copies }, (_, index) => (
          <span
            key={index}
            className="text-muted-foreground shrink-0 pr-8 font-mono text-sm"
          >
            {line}
            {'  /  '}
          </span>
        ))}
      </motion.div>
    </div>
  );
};
