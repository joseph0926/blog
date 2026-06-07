import * as React from 'react';

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

// `window.matchMedia`는 외부 가변 소스라, effect 안에서 state로 미러링하지 않고
// useSyncExternalStore contract로 구독한다. 단위 테스트용으로 export한다.
export function subscribeMobile(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

export function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function getMobileServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    getMobileServerSnapshot,
  );
}
