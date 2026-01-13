import type { Transition, Variants } from 'motion/react';

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'tween',
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1],
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: smoothTransition,
  },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const springHover: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: springTransition,
  },
};

export const cardHover: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  },
  hover: {
    y: -4,
    boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.15)',
    transition: springTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: smoothTransition,
  },
};

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

export const underlineExpand: Variants = {
  rest: { scaleX: 0 },
  hover: {
    scaleX: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
};

export const skeletonContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const skeletonItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 80,
    },
  },
};
