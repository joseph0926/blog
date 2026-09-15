'use client';

import 'lenis/dist/lenis.css';
import { ReactLenis } from 'lenis/react';
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

type AboutScrollValue = {
  coverRef: RefObject<HTMLElement | null>;
  connectRef: RefObject<HTMLElement | null>;
  coverProgress: MotionValue<number>;
  connectProgress: MotionValue<number>;
  reduceMotion: boolean;
  mounted: boolean;
  /** 마운트됐고 저감 모드가 아닐 때만 스크롤 스크럽을 적용한다. */
  scrub: boolean;
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
  children,
}: {
  children: React.ReactNode;
}) => {
  const coverRef = useRef<HTMLElement | null>(null);
  const connectRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  /** SSR과 첫 클라이언트 렌더를 같게 유지하려고 마운트 뒤에만 저감 설정을 반영한다. */
  const reduceMotion = mounted && prefersReducedMotion;
  const fallback = useMotionValue(0);

  const { scrollYProgress: coverProgress } = useScroll({
    target: coverRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: connectProgress } = useScroll({
    target: connectRef,
    offset: ['start end', 'end end'],
  });

  return (
    <AboutScrollContext.Provider
      value={{
        coverRef,
        connectRef,
        coverProgress: mounted ? coverProgress : fallback,
        connectProgress: mounted ? connectProgress : fallback,
        reduceMotion,
        mounted,
        scrub: mounted && !reduceMotion,
      }}
    >
      <ReactLenis
        root
        options={{
          lerp: 0.09,
          anchors: true,
          respectReducedMotion: true,
        }}
      >
        {children}
      </ReactLenis>
    </AboutScrollContext.Provider>
  );
};
