'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { clamp, clearReel, layoutReel, type ReelOptions } from './layout-reel';

/**
 * pending: 서버 렌더와 hydration 직후. 회전 없이 읽히는 목록으로 둔다.
 * static: 저감 모드. 같은 내용을 고정 없이 정적 목록으로 둔다.
 * reel: 스크롤이 다이얼을 돌린다.
 */
export type DialMode = 'pending' | 'static' | 'reel';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

export function useDialMode(): DialMode {
  return useSyncExternalStore<DialMode>(
    subscribeReducedMotion,
    () => (window.matchMedia(REDUCED_MOTION).matches ? 'static' : 'reel'),
    () => 'pending',
  );
}

const collect = <T extends HTMLElement>(refs: (T | null)[]) =>
  refs.filter((item): item is T => item !== null);

/**
 * 스크롤, 창 크기 변화, 문서 높이 변화(본문 스트리밍), 웹 서체 적용 뒤에 다시 그린다.
 * 서체가 바뀌면 항목 높이가, 본문이 들어오면 기준점 위치가 달라진다.
 */
function subscribeLayout(render: () => void, remeasure: () => void) {
  const onResize = () => {
    remeasure();
    render();
  };
  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', onResize);
  const observer = new ResizeObserver(onResize);
  observer.observe(document.body);
  let active = true;
  document.fonts?.ready.then(() => {
    if (active) onResize();
  });
  return () => {
    active = false;
    observer.disconnect();
    window.removeEventListener('scroll', render);
    window.removeEventListener('resize', onResize);
  };
}

/**
 * 화면에 고정된 무대에서 스크롤이 항목을 한 칸씩 돌리는 릴. 홈 질문 다이얼과 about 작업 기록이 쓴다.
 * 트랙 높이는 `(count - 1) * 50svh + 100svh`이고, 무대 높이의 절반을 스크롤할 때마다 한 칸 넘어간다.
 */
export function usePinnedReel<T extends HTMLElement>(
  count: number,
  options: ReelOptions,
  enabled = true,
) {
  const preferredMode = useDialMode();
  const mode = enabled ? preferredMode : 'static';
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(T | null)[]>([]);
  const metrics = useRef({ top: 0, step: 1 });
  const optionsRef = useRef(options);
  const [centerIndex, setCenterIndex] = useState(0);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const items = () => collect(itemRefs.current);
    if (mode !== 'reel') {
      clearReel(items());
      return;
    }

    const measure = () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      metrics.current = {
        top: track.getBoundingClientRect().top + window.scrollY,
        step: Math.max(stage.offsetHeight / 2, 1),
      };
    };
    const render = () => {
      const { top, step } = metrics.current;
      const position = clamp((window.scrollY - top) / step, 0, count - 1);
      layoutReel(items(), position, optionsRef.current);
      setCenterIndex(Math.round(position));
    };

    measure();
    render();
    const root = document.documentElement;
    root.classList.add('dial-snap');
    const unsubscribe = subscribeLayout(render, measure);
    return () => {
      unsubscribe();
      root.classList.remove('dial-snap');
      clearReel(items());
    };
  }, [mode, count]);

  const scrollToIndex = useCallback((index: number) => {
    const { top, step } = metrics.current;
    const reduce = window.matchMedia(REDUCED_MOTION).matches;
    window.scrollTo({
      top: top + index * step,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }, []);

  const itemRef = useCallback(
    (index: number) => (element: T | null) => {
      itemRefs.current[index] = element;
    },
    [],
  );

  const getItem = useCallback(
    (index: number) => itemRefs.current[index] ?? null,
    [],
  );

  return {
    mode,
    trackRef,
    stageRef,
    itemRef,
    getItem,
    centerIndex,
    scrollToIndex,
  };
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

type SectionDialOptions = ReelOptions & {
  /** 다음 기준점이 읽는 선의 이 거리(px) 안으로 들어올 때만 다이얼이 돈다. */
  turnDistance?: number;
  /** 읽는 선의 위치. 뷰포트 높이에 대한 비율이다. */
  readingLine?: number;
};

/**
 * 문서의 기준점(헤딩, 장)을 따라 여백의 다이얼을 돌린다. 읽는 동안에는 멈춰 있다.
 * `anchorIds`의 첫 값이 `null`이면 그 항목은 문서 맨 위(도입)를 뜻한다.
 */
export function useSectionDial<T extends HTMLElement>(
  anchorIds: (string | null)[],
  options: SectionDialOptions,
) {
  const mode = useDialMode();
  const itemRefs = useRef<(T | null)[]>([]);
  const optionsRef = useRef(options);
  const [current, setCurrent] = useState(0);
  const anchorKey = anchorIds.join('|');

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const items = () => collect(itemRefs.current);
    const ids = anchorKey.split('|');

    // 본문은 Suspense로 늦게 들어올 수 있으므로 기준점을 그릴 때마다 다시 찾는다.
    // 아직 없는 기준점은 지나가지 않은 것으로 본다.
    const offsetOf = (id: string, line: number) => {
      if (!id) return -Infinity;
      const anchor = document.getElementById(id);
      return anchor ? anchor.getBoundingClientRect().top - line : Infinity;
    };

    const render = () => {
      const {
        turnDistance = 200,
        readingLine = 0.4,
        ...reel
      } = optionsRef.current;
      const line = window.innerHeight * readingLine;
      const offsets = ids.map((id) => offsetOf(id, line));
      const passed = offsets.filter((offset) => offset <= 0).length;
      const next = offsets[passed];
      let position = Math.max(passed - 1, 0);
      if (passed > 0 && next !== undefined) {
        position += smoothstep(clamp(1 - next / turnDistance, 0, 1));
      }
      if (mode === 'reel') layoutReel(items(), position, reel);
      setCurrent(Math.round(position));
    };

    render();
    if (mode !== 'reel') clearReel(items());
    const unsubscribe = subscribeLayout(render, () => {});
    return () => {
      unsubscribe();
      clearReel(items());
    };
  }, [mode, anchorKey]);

  const itemRef = useCallback(
    (index: number) => (element: T | null) => {
      itemRefs.current[index] = element;
    },
    [],
  );

  return { mode, itemRef, current };
}
