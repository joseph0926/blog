// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { layoutReel } from '@/components/dial/layout-reel';
import { useSectionDial } from '@/components/dial/use-dial';

const weight = { center: 640, edge: 300 };

test('긴 질문의 높이를 확보하고 고른 크기와 불투명도 하한을 지킨다', () => {
  const items = [100, 240, 100, 100].map((height) => {
    const item = document.createElement('a');
    Object.defineProperty(item, 'offsetHeight', { value: height });
    return item;
  });
  layoutReel(items, 0, {
    space: 32,
    weight,
    scalePerStep: 0.22,
    minimumScale: 0.5,
    minimumOpacity: 0.18,
    reserveFullHeight: true,
  });
  expect(items[0].style.transform).toBe('translateY(-50px) scale(1)');
  expect(items[1].style.transform).toBe('translateY(82px) scale(0.78)');
  expect(items[2].style.transform).toBe('translateY(354px) scale(0.56)');
  expect(items[3].style.transform).toBe('translateY(486px) scale(0.5)');
  expect(Number(items[1].style.opacity)).toBeCloseTo(0.66);
  expect(Number(items[3].style.opacity)).toBeCloseTo(0.18);
});

test('소개 페이지가 사용하는 기존 릴 기본값은 유지한다', () => {
  const items = Array.from({ length: 4 }, () => document.createElement('a'));
  layoutReel(items, 0, { space: 32, weight });
  expect(items[3].style.transform).toContain('scale(0.35)');
  expect(items[3].style.opacity).toBe('0');
});

test('현재 절은 제목이 96px 읽는 선을 지날 때만 바뀐다', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  const first = document.createElement('h2');
  first.id = 'first-section';
  const second = document.createElement('h2');
  second.id = 'second-section';
  let firstTop = 97;
  vi.spyOn(first, 'getBoundingClientRect').mockImplementation(
    () => ({ top: firstTop }) as DOMRect,
  );
  vi.spyOn(second, 'getBoundingClientRect').mockReturnValue({
    top: 400,
  } as DOMRect);
  const container = document.createElement('div');
  document.body.append(first, second, container);
  const root = createRoot(container);
  function Guide() {
    const { current } = useSectionDial([null, first.id, second.id], {
      space: 14,
      weight,
      showAll: true,
      readingOffset: 96,
      turnDistance: 0,
    });
    return <output>{current}</output>;
  }
  try {
    await act(async () => root.render(<Guide />));
    expect(container.textContent).toBe('0');
    firstTop = 96;
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(container.textContent).toBe('1');
    firstTop = 97;
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
    });
    expect(container.textContent).toBe('0');
  } finally {
    await act(async () => root.unmount());
    first.remove();
    second.remove();
    container.remove();
    vi.unstubAllGlobals();
  }
});
