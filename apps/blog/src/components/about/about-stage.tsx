'use client';

import { motion, transform, useTransform } from 'motion/react';
import { useAboutScroll } from './about-scroll';

const restingOpacity = 0.22;

export const AboutStage = () => {
  const { coverProgress, connectProgress, reduceMotion } = useAboutScroll();
  const hiddenOpacity = reduceMotion ? 0.12 : 0;
  const coverOpacity = useTransform(
    coverProgress,
    transform([0, 1], [restingOpacity, hiddenOpacity]),
  );
  const connectOpacity = useTransform(
    connectProgress,
    transform([0, 1], [hiddenOpacity, restingOpacity]),
  );
  const opacity = useTransform(
    [coverOpacity, connectOpacity],
    ([fromCover, fromConnect]: number[]) => Math.max(fromCover, fromConnect),
  );
  const backgroundPositionY = useTransform(
    coverProgress,
    transform([0, 1], ['0px', reduceMotion ? '0px' : '-64px']),
  );

  return (
    <motion.div
      aria-hidden="true"
      className="about-stage"
      style={{ opacity, backgroundPositionY }}
    />
  );
};
