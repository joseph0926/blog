'use client';

import {
  motion,
  SpringOptions,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';

const SPRING = {
  damping: 20,
} satisfies SpringOptions;

export const TopProgress = () => {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, SPRING);
  const scaleX = useTransform(progress, [0, 1], [0, 1]);

  return (
    <div className="bg-muted/30 fixed top-0 left-0 z-10 h-2 w-full overflow-hidden">
      <motion.div
        style={{ scaleX }}
        className="h-full w-full origin-left bg-indigo-500 will-change-transform"
      />
    </div>
  );
};
