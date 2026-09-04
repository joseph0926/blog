'use client';

import { motion, transform, useTransform } from 'motion/react';
import { useAboutScroll } from './about-scroll';

export const AboutStage = () => {
  const { coverProgress, reduceMotion } = useAboutScroll();
  const opacity = useTransform(
    coverProgress,
    transform([0, 1], [0.22, reduceMotion ? 0.12 : 0]),
  );

  return (
    <motion.div
      aria-hidden="true"
      className="about-stage"
      style={{ opacity }}
    />
  );
};
