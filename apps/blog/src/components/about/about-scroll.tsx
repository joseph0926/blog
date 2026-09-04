'use client';

import {
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import {
  createContext,
  type RefObject,
  useContext,
  useRef,
  useSyncExternalStore,
} from 'react';

export type MeasurementRatio = {
  id: string;
  ratio: number;
};

type AboutScrollValue = {
  coverRef: RefObject<HTMLElement | null>;
  reelRef: RefObject<HTMLDivElement | null>;
  coverProgress: MotionValue<number>;
  reelProgress: MotionValue<number>;
  ratios: MeasurementRatio[];
  reduceMotion: boolean;
  mounted: boolean;
};

const AboutScrollContext = createContext<AboutScrollValue | null>(null);

const subscribeNoop = () => () => {};

export const useAboutScroll = () => {
  const value = useContext(AboutScrollContext);
  if (!value) {
    throw new Error('useAboutScroll must be used inside AboutScrollProvider');
  }
  return value;
};

export const AboutScrollProvider = ({
  ratios,
  children,
}: {
  ratios: MeasurementRatio[];
  children: React.ReactNode;
}) => {
  const coverRef = useRef<HTMLElement | null>(null);
  const reelRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const fallback = useMotionValue(0);

  const { scrollYProgress: coverProgress } = useScroll({
    target: coverRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: reelProgress } = useScroll({
    target: reelRef,
    offset: ['start start', 'end end'],
  });

  return (
    <AboutScrollContext.Provider
      value={{
        coverRef,
        reelRef,
        coverProgress: mounted ? coverProgress : fallback,
        reelProgress: mounted ? reelProgress : fallback,
        ratios,
        reduceMotion,
        mounted,
      }}
    >
      {children}
    </AboutScrollContext.Provider>
  );
};
