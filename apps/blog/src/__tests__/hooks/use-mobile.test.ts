// @vitest-environment happy-dom
import {
  getMobileServerSnapshot,
  getMobileSnapshot,
  subscribeMobile,
} from '@/hooks/use-mobile';

function stubMatchMedia(matches: boolean) {
  const mql = {
    matches,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  const matchMedia = vi.fn(() => mql);
  window.matchMedia = matchMedia as unknown as typeof window.matchMedia;
  return { mql, matchMedia };
}

describe('hooks/use-mobile를 테스트합니다.', () => {
  describe('getMobileServerSnapshot 함수를 테스트합니다.', () => {
    it('SSR snapshot은 항상 false여서 hydration mismatch를 피해야합니다.', () => {
      expect(getMobileServerSnapshot()).toBe(false);
    });
  });

  describe('getMobileSnapshot 함수를 테스트합니다.', () => {
    it('window.innerWidth가 아니라 matchMedia().matches를 읽어야합니다.', () => {
      const { matchMedia } = stubMatchMedia(true);
      expect(getMobileSnapshot()).toBe(true);
      expect(matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });

    it('matchMedia가 매치되지 않으면 false를 반환해야합니다.', () => {
      stubMatchMedia(false);
      expect(getMobileSnapshot()).toBe(false);
    });
  });

  describe('subscribeMobile 함수를 테스트합니다.', () => {
    it('change 리스너를 등록하고 cleanup이 해제해야합니다.', () => {
      const { mql } = stubMatchMedia(false);
      const onChange = vi.fn();
      const cleanup = subscribeMobile(onChange);
      expect(mql.addEventListener).toHaveBeenCalledWith('change', onChange);
      cleanup();
      expect(mql.removeEventListener).toHaveBeenCalledWith('change', onChange);
    });
  });
});
